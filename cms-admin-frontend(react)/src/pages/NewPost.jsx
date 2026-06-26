import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Toast from "../components/Toast";
import { useSearchParams } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

const API = "http://localhost:3000/api";

const AUTHORS = ["Nandini S.", "Rishank T.", "Harsh K.", "Person R."];
const TOOLBAR = [
  { cmd: "bold", icon: "format_bold" },
  { cmd: "italic", icon: "format_italic" },
  { cmd: "underline", icon: "format_underlined" },
  null,
  { cmd: "heading", icon: "title" },
  { cmd: "quote", icon: "format_quote" },
  { cmd: "insertUnorderedList", icon: "format_list_bulleted" },
  { cmd: "insertOrderedList", icon: "format_list_numbered" },
  null,
  { cmd: "link", icon: "link" },
  { cmd: "image", icon: "image" },
];

export default function NewPost() {
  const [params] = useSearchParams();
  const postId = params.get("id");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [author, setAuthor] = useState(AUTHORS[0]);
  const [tags, setTags] = useState(["Breaking"]);
  const editorRef = useRef(null);
  const [toast, setToast] = useState(null);
  const scheduleRef = useRef(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [schedDate, setSchedDate] = useState("");
  const [schedTime, setSchedTime] = useState("");
  const [gifUrl, setGifUrl] = useState("");

  useEffect(() => {
    if (postId) loadPost(postId);
  }, [postId]);

  useEffect(() => {
    function handleClick(e) {
      if (scheduleRef.current && !scheduleRef.current.contains(e.target)) {
        setScheduleOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    fetch(API + "/categories")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategories(d.categories.map((c) => c.name));
      })
      .catch(() => {});
  }, []);

  // this generates auto slug from the title
  useEffect(() => {
    setSlug(
      title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
    );
  }, [title]);

  async function loadPost(id) {
    try {
      const res = await fetch(API + "/posts/" + id);
      const data = await res.json();
      if (!data.success) return;
      const post = data.post;
      setTitle(post.title || "");
      setSlug(post.slug || "");
      setExcerpt(post.excerpt || "");
      setCategory(post.category || "");
      setAuthor(post.author || AUTHORS[0]);
      setGifUrl(post.gif_url || "");
      if (editorRef.current) editorRef.current.innerHTML = post.content || "";
    } catch {}
  }

  function getFormData(status, scheduled_at) {
    return {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content: editorRef.current?.innerHTML || "",
      category,
      tags: tags.join(","),
      author,
      gif_url: gifUrl.trim() || null,
      status,
      scheduled_at: scheduled_at || null,
    };
  }

  async function submitPost(status, scheduled_at) {
    const data = getFormData(status, scheduled_at);
    if (!data.title) {
      setToast({ message: "Please add a post title first.", type: "warn" });
      return;
    }
    try {
      const url = postId ? API + "/posts/" + postId : API + "/posts";
      const method = postId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        const msgs = {
          published: "Post published successfully!",
          draft: "Draft saved!",
          scheduled: `Post scheduled for ${scheduled_at}`,
        };
        setToast({
          message: msgs[status],
          type: status === "published" ? "success" : status,
        });
      } else {
        setToast({
          message: result.message || "Something went wrong.",
          type: "warn",
        });
      }
    } catch {
      setToast({ message: "Could not connect to server.", type: "warn" });
    }
  }

  function execCmd(cmd) {
    editorRef.current?.focus();
    if (cmd === "heading") document.execCommand("formatBlock", false, "h2");
    else if (cmd === "quote")
      document.execCommand("formatBlock", false, "blockquote");
    else if (cmd === "code")
      document.execCommand("insertHTML", false, "<pre><code></code></pre>");
    else document.execCommand(cmd, false, null);
  }

  function removeTag(tag) {
    setTags((t) => t.filter((x) => x !== tag));
  }

  const topbarActions = (
    <>
      <button
        style={{
          background: "var(--surface2)",
          color: "var(--text)",
          border: `1px solid var(--border)`,
          padding: "8px 16px",
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontFamily: "Inter, sans-serif",
        }}
        onClick={() => submitPost("draft")}
      >
        <span className="material-icons" style={{ fontSize: 16 }}>
          save
        </span>{" "}
        Save Draft
      </button>
      <div style={{ position: "relative" }} ref={scheduleRef}>
        <button
          style={{
            background: "rgba(108,99,255,0.12)",
            color: "var(--accent2)",
            border: `1px solid var(--accent)`,
            padding: "8px 16px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "Inter, sans-serif",
          }}
          onClick={() => setScheduleOpen((o) => !o)}
        >
          <span className="material-icons" style={{ fontSize: 16 }}>
            schedule
          </span>{" "}
          Schedule
        </button>
        {scheduleOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              right: 0,
              width: 240,
              background: "var(--surface)",
              border: `1px solid var(--border)`,
              borderRadius: 10,
              padding: 16,
              zIndex: 999,
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text)",
                marginBottom: 14,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                className="material-icons"
                style={{ fontSize: 16, color: "var(--accent2)" }}
              >
                event
              </span>{" "}
              Schedule Post
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 5,
                marginBottom: 12,
              }}
            >
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}
              >
                Date
              </label>
              <input
                type="date"
                value={schedDate}
                onChange={(e) => setSchedDate(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--surface2)",
                  border: `1px solid var(--border)`,
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "var(--text)",
                  fontFamily: "Inter, sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 5,
                marginBottom: 12,
              }}
            >
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}
              >
                Time
              </label>
              <input
                type="time"
                value={schedTime}
                onChange={(e) => setSchedTime(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--surface2)",
                  border: `1px solid var(--border)`,
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "var(--text)",
                  fontFamily: "Inter, sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                marginTop: 4,
              }}
            >
              <button
                style={{
                  background: "none",
                  border: `1px solid var(--border)`,
                  borderRadius: 6,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--muted)",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                }}
                onClick={() => setScheduleOpen(false)}
              >
                Cancel
              </button>
              <button
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  fontSize: 12,
                }}
                onClick={() => {
                  if (!schedDate || !schedTime) {
                    setToast({
                      message: "Please pick a date and time.",
                      type: "warn",
                    });
                    return;
                  }
                  setScheduleOpen(false);
                  submitPost("scheduled", schedDate + " " + schedTime + ":00");
                }}
              >
                <span className="material-icons" style={{ fontSize: 14 }}>
                  check
                </span>{" "}
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
      <button
        style={{
          background: "var(--accent)",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "8px 16px",
          textDecoration: "none",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "Inter, sans-serif",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
        onClick={() => submitPost("published")}
      >
        <span className="material-icons" style={{ fontSize: 16 }}>
          send
        </span>{" "}
        Publish
      </button>
    </>
  );

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      {/*main*/}
      <div
        style={{
          marginLeft: "var(--sidebar-w)",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {/*topbar*/}
        <Topbar
          title={postId ? "Edit Post" : "New Post"}
          backTo="/posts"
          showNewPost={false}
          actions={topbarActions}
        />
        {/* content */}
        <div style={{ dsiplay: "flex", padding: 28 }}>
          {/* form layout */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 280px",
              gap: 24,
              alignItems: "start",
            }}
          >
            {/* left side main form */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* group */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  Post Title
                </label>
                <input
                  type="text"
                  placeholder="Enter your post title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    padding: "14px",
                    background: "var(--surface2)",
                    border: `1px solid var(--border)`,
                    borderRadius: 8,
                    fontSize: 20,
                    fontWeight: 700,
                    color: "var(--text)",
                    width: "100%",
                    outline: "none",
                    fontFamily: "Inter, sans-serif",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  Slug{" "}
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--muted)",
                      fontWeight: "normal",
                      textTransform: "none",
                      letterSpacing: 0,
                    }}
                  >
                    Auto-generated from title
                  </span>
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "var(--surface2)",
                    border: `1px solid var(--border)`,
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <span
                    style={{
                      background: "var(--surface)",
                      borderRight: `1px solid var(--border)`,
                      padding: "9px 12px",
                      fontSize: 13,
                      color: "var(--muted)",
                      whiteSpace: "nowrap",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    inkwell.com/
                  </span>
                  <input
                    type="text"
                    placeholder="your-post-slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      fontSize: 13,
                      color: "var(--text)",
                      fontFamily: "Inter, sans-serif",
                      outline: "none",
                      boxSizing: "border-box",
                      border: "none",
                      borderRadius: 0,
                      background: "transparent",
                      flex: 1,
                    }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  Excerpt{" "}
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--muted)",
                      fontWeight: "normal",
                      textTransform: "none",
                      letterSpacing: 0,
                    }}
                  >
                    Short description shown in listings
                  </span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Write a brief summary of this post…"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  style={{
                    width: "100%",
                    background: "var(--surface2)",
                    border: `1px solid var(--border)`,
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 13,
                    color: "var(--text)",
                    fontFamily: "Inter, sans-serif",
                    outline: "none",
                    boxSizing: "border-box",
                    resize: "vertical",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  Content
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    padding: "8px 10px",
                    background: "var(--surface)",
                    border: `1px solid var(--border)`,
                    borderBottom: "none",
                    borderRadius: "8px 8px 0 0",
                  }}
                >
                  {TOOLBAR.map((btn, i) =>
                    btn === null ? (
                      <div
                        key={i}
                        style={{
                          width: 1,
                          height: 20,
                          background: "var(--border)",
                          margin: "0 4px",
                        }}
                      />
                    ) : (
                      <button
                        key={btn.cmd}
                        style={{
                          background: "none",
                          border: "none",
                          padding: "5px 7px",
                          borderRadius: 6,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          color: "var(--muted)",
                        }}
                        title={btn.cmd}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          execCmd(btn.cmd);
                        }}
                      >
                        <span
                          className="material-icons"
                          style={{ fontSize: 18 }}
                        >
                          {btn.icon}
                        </span>
                      </button>
                    ),
                  )}
                </div>
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  style={{
                    padding: "10px 14px",
                    background: "var(--surface2)",
                    border: `1px solid var(--border)`,
                    borderRadius: "0 0 8px 8px",
                    fontSize: 13,
                    color: "var(--text)",
                    fontFamily: "Inter, sans-serif",
                    outline: "none",
                    minHeight: 280,
                    lineHeight: 1.7,
                    boxSizing: "border-box",
                  }}
                  data-placeholder="Start writing your post here..."
                  onFocus={(e) => {
                    if (!e.target.textContent) e.target.innerHTML = "";
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 15 }}>
                    gif
                  </span>
                  GIF / Image URL
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--muted)",
                      fontWeight: "normal",
                      textTransform: "none",
                      letterSpacing: 0,
                    }}
                  >
                    Paste a Giphy or image link
                  </span>
                </label>
                <input
                  type="url"
                  placeholder="https://media.giphy.com/media/.../giphy.gif"
                  value={gifUrl}
                  onChange={(e) => setGifUrl(e.target.value)}
                  style={{
                    width: "100%",
                    background: "var(--surface2)",
                    border: `1px solid var(--border)`,
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 13,
                    color: "var(--text)",
                    fontFamily: "Inter, sans-serif",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {gifUrl.trim() && (
                  <div
                    style={{
                      marginTop: 8,
                      borderRadius: 8,
                      overflow: "hidden",
                      border: `1px solid var(--border)`,
                      background: "var(--surface)",
                      position: "relative",
                    }}
                  >
                    <img
                      src={gifUrl.trim()}
                      alt="GIF preview"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextSibling.style.display = "flex";
                      }}
                      style={{
                        width: "100%",
                        maxHeight: 1000,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    <div
                      style={{
                        display: "none",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: "1.5rem",
                        color: "var(--muted)",
                        fontSize: 13,
                      }}
                    >
                      <span className="material-icons" style={{ fontSize: 18 }}>
                        broken_image
                      </span>
                      Could not load image — check the URL
                    </div>
                    <button
                      onClick={() => setGifUrl("")}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        background: "rgba(0,0,0,0.55)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: 26,
                        height: 26,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="Remove GIF"
                    >
                      <span className="material-icons" style={{ fontSize: 14 }}>
                        close
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* left side form sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  background: "var(--surface)",
                  border: `1px solid var(--border)`,
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    marginBottom: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 15 }}>
                    folder
                  </span>{" "}
                  Category
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 9,
                    marginBottom: 12,
                  }}
                >
                  {categories.map((cat) => (
                    <label
                      key={cat}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 13,
                        color: "var(--text)",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={cat}
                        checked={category === cat}
                        onChange={() => setCategory(cat)}
                        style={{
                          cursor: "pointer",
                          accentColor: "var(--accent)",
                        }}
                      />
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </label>
                  ))}
                </div>
                <button
                  style={{
                    background: "none",
                    border: `1px dashed var(--border)`,
                    borderRadius: 6,
                    padding: "7px 12px",
                    fontSize: 12,
                    color: "var(--muted)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    width: "100%",
                    fontFamily: "Inter, sans-serif",
                  }}
                ></button>
              </div>
              <div
                style={{
                  background: "var(--surface)",
                  border: `1px solid var(--border)`,
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    marginBottom: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 15 }}>
                    label
                  </span>{" "}
                  Tags
                </div>
                <input
                  type="text"
                  placeholder="Add tag and press Enter"
                  style={{
                    width: "100%",
                    background: "var(--surface2)",
                    border: `1px solid var(--border)`,
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 13,
                    color: "var(--text)",
                    fontFamily: "Inter, sans-serif",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.target.value.trim()) {
                      setTags((t) => [...t, e.target.value.trim()]);
                      e.target.value = "";
                    }
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginTop: 10,
                  }}
                >
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        background: "rgba(108,99,255,0.12)",
                        border: `1px solid var(--accent)`,
                        color: "var(--accent2)",
                        fontSize: 12,
                        padding: "3px 8px",
                        borderRadius: 20,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        cursor: "pointer",
                      }}
                      onClick={() => removeTag(tag)}
                    >
                      {tag}{" "}
                      <span className="material-icons" style={{ fontSize: 13 }}>
                        close
                      </span>
                    </span>
                  ))}
                </div>
              </div>
              <div
                style={{
                  background: "var(--surface)",
                  border: `1px solid var(--border)`,
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    marginBottom: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 15 }}>
                    person
                  </span>{" "}
                  Author
                </div>
                <select
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  style={{
                    width: "100%",
                    background: "var(--surface2)",
                    border: `1px solid var(--border)`,
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 13,
                    color: "var(--text)",
                    fontFamily: "Inter, sans-serif",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                >
                  {AUTHORS.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </div>
  );
}
