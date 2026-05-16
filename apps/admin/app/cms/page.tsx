"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, toast } from "@kangba/ui";
import { adminApi } from "@/lib/admin-api";
import { BodyTextField } from "@/components/body-text-field";
import { ImageUploadField } from "@/components/image-upload-field";
import { zh } from "@/lib/zh";

type Tab = "pages" | "posts" | "banners";

type PageRow = {
  id?: string;
  slug: string;
  locale: string;
  title: string;
  body: string;
  published: boolean;
};

type PostRow = PageRow & { excerpt?: string; coverImageUrl?: string };

type BannerRow = {
  id?: string;
  locale: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  linkUrl?: string;
  sortOrder: number;
  active: boolean;
};

export default function AdminCmsPage() {
  const [tab, setTab] = useState<Tab>("pages");
  const [pages, setPages] = useState<PageRow[]>([]);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [banners, setBanners] = useState<BannerRow[]>([]);

  const [pageForm, setPageForm] = useState<PageRow>({
    slug: "about",
    locale: "en",
    title: "",
    body: "",
    published: false,
  });

  const [postForm, setPostForm] = useState<PostRow>({
    slug: "news",
    locale: "en",
    title: "",
    body: "",
    excerpt: "",
    coverImageUrl: "",
    published: false,
  });

  const [bannerForm, setBannerForm] = useState<BannerRow>({
    locale: "en",
    title: "",
    subtitle: "",
    imageUrl: "",
    linkUrl: "",
    sortOrder: 0,
    active: true,
  });

  useEffect(() => {
    void adminApi.cmsPages().then((rows) => setPages(rows as PageRow[]));
    void adminApi.cmsPosts().then((rows) => setPosts(rows as PostRow[]));
    void adminApi.cmsBanners().then((rows) => setBanners(rows as BannerRow[]));
  }, []);

  function pickPage(row: PageRow) {
    setTab("pages");
    setPageForm({ ...row });
  }

  function pickPost(row: PostRow) {
    setTab("posts");
    setPostForm({ coverImageUrl: "", excerpt: "", ...row });
  }

  function pickBanner(row: BannerRow) {
    setTab("banners");
    setBannerForm({ ...row });
  }

  async function savePage() {
    try {
      await adminApi.savePage(pageForm);
      toast.success("页面已保存");
      setPages((await adminApi.cmsPages()) as PageRow[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    }
  }

  async function savePost() {
    try {
      await adminApi.savePost(postForm);
      toast.success("文章已保存");
      setPosts((await adminApi.cmsPosts()) as PostRow[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    }
  }

  async function saveBanner() {
    try {
      await adminApi.saveBanner(bannerForm);
      toast.success("横幅已保存");
      setBanners((await adminApi.cmsBanners()) as BannerRow[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{zh.nav.cms}</h1>
      <p className="text-sm text-muted-foreground">编辑文字正文，上传/替换插画与封面图。</p>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["pages", "页面"],
            ["posts", "文章"],
            ["banners", "横幅"],
          ] as const
        ).map(([id, label]) => (
          <Button key={id} variant={tab === id ? "secondary" : "outline"} size="sm" onClick={() => setTab(id)}>
            {label}
          </Button>
        ))}
      </div>

      {tab === "pages" && (
        <Card>
          <CardHeader>
            <CardTitle>页面</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3 md:col-span-2">
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <Label>{zh.common.slug}</Label>
                  <Input value={pageForm.slug} onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })} />
                </div>
                <div>
                  <Label>{zh.common.locale}</Label>
                  <Input value={pageForm.locale} onChange={(e) => setPageForm({ ...pageForm, locale: e.target.value })} />
                </div>
                <div>
                  <Label>标题</Label>
                  <Input value={pageForm.title} onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })} />
                </div>
              </div>
              <BodyTextField value={pageForm.body} onChange={(body) => setPageForm({ ...pageForm, body })} />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={pageForm.published}
                  onChange={(e) => setPageForm({ ...pageForm, published: e.target.checked })}
                />
                已发布
              </label>
              <Button onClick={() => void savePage()}>保存页面</Button>
            </div>
            <div className="md:col-span-2">
              <p className="mb-2 text-sm font-medium">已有页面（点击编辑）</p>
              <ul className="space-y-1 text-sm">
                {pages.map((p) => (
                  <li key={`${p.slug}-${p.locale}`}>
                    <button type="button" className="text-left underline-offset-2 hover:underline" onClick={() => pickPage(p)}>
                      {p.title || p.slug} ({p.locale})
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "posts" && (
        <Card>
          <CardHeader>
            <CardTitle>文章</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <Label>{zh.common.slug}</Label>
                <Input value={postForm.slug} onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })} />
              </div>
              <div>
                <Label>{zh.common.locale}</Label>
                <Input value={postForm.locale} onChange={(e) => setPostForm({ ...postForm, locale: e.target.value })} />
              </div>
              <div>
                <Label>标题</Label>
                <Input value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>摘要</Label>
              <Input value={postForm.excerpt ?? ""} onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })} />
            </div>
            <ImageUploadField
              label="封面插画"
              category="cms"
              value={postForm.coverImageUrl ?? ""}
              onChange={(coverImageUrl) => setPostForm({ ...postForm, coverImageUrl })}
            />
            <BodyTextField value={postForm.body} onChange={(body) => setPostForm({ ...postForm, body })} />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={postForm.published}
                onChange={(e) => setPostForm({ ...postForm, published: e.target.checked })}
              />
              已发布
            </label>
            <Button onClick={() => void savePost()}>保存文章</Button>
            <ul className="space-y-1 text-sm">
              {posts.map((p) => (
                <li key={`${p.slug}-${p.locale}`}>
                  <button type="button" className="underline-offset-2 hover:underline" onClick={() => pickPost(p)}>
                    {p.title || p.slug} ({p.locale})
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {tab === "banners" && (
        <Card>
          <CardHeader>
            <CardTitle>首页横幅</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>{zh.common.locale}</Label>
                <Input value={bannerForm.locale} onChange={(e) => setBannerForm({ ...bannerForm, locale: e.target.value })} />
              </div>
              <div>
                <Label>标题</Label>
                <Input value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label>副标题</Label>
                <Input value={bannerForm.subtitle ?? ""} onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label>链接</Label>
                <Input value={bannerForm.linkUrl ?? ""} onChange={(e) => setBannerForm({ ...bannerForm, linkUrl: e.target.value })} />
              </div>
            </div>
            <ImageUploadField
              label="横幅插画"
              category="banners"
              value={bannerForm.imageUrl ?? ""}
              onChange={(imageUrl) => setBannerForm({ ...bannerForm, imageUrl })}
            />
            <Button onClick={() => void saveBanner()}>保存横幅</Button>
            <ul className="space-y-1 text-sm">
              {banners.map((b) => (
                <li key={b.id ?? `${b.title}-${b.locale}`}>
                  <button type="button" className="underline-offset-2 hover:underline" onClick={() => pickBanner(b)}>
                    {b.title} ({b.locale}) {b.active ? "· 启用" : ""}
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
