import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/useAuth";
import { uploadSnap, getAllSnaps } from "../api/snaps";

const STORY_DURATION = 4000;

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [snapPreview, setSnapPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const { data: snapsData } = useQuery({
    queryKey: ["snaps"],
    queryFn: getAllSnaps,
  });
  const mySnaps = (snapsData?.data?.snaps || []).filter(
    (s) => s.customer_id === user?.id,
  );

  const [viewedIds, setViewedIds] = useState(() => new Set());
  const [storyOpen, setStoryOpen] = useState(false);
  const [storyIdx, setStoryIdx] = useState(0);

  const openStory = (idx) => {
    setStoryIdx(idx);
    setStoryOpen(true);
    setViewedIds((prev) => new Set(prev).add(mySnaps[idx]?.id));
  };

  const goNext = () => {
    if (storyIdx < mySnaps.length - 1) {
      const next = storyIdx + 1;
      setStoryIdx(next);
      setViewedIds((prev) => new Set(prev).add(mySnaps[next]?.id));
    } else {
      setStoryOpen(false);
    }
  };

  const goPrev = () => {
    if (storyIdx > 0) setStoryIdx(storyIdx - 1);
  };

  useEffect(() => {
    if (!storyOpen || mySnaps.length === 0) return;
    const timer = setTimeout(goNext, STORY_DURATION);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyOpen, storyIdx, mySnaps.length]);

  if (!user) {
    navigate("/login");
    return null;
  }

  const joined = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";
  const initials = (user.name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const fields = [
    { label: "Full Name", value: user.name || "-" },
    { label: "Email", value: user.email || "-" },
    {
      label: "Contact Number",
      value: user.phone || "Not Provided",
      muted: !user.phone,
    },
    { label: "Member since", value: joined },
  ];

  const handleSnapSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSnapPreview(URL.createObjectURL(file));
    setUploadError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append("snap", file);
    formData.append("customer_id", user.id);

    try {
      await uploadSnap(formData);
    } catch (err) {
      console.error("Snap upload failed:", err);
      setUploadError("Couldn't upload snap. Try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <main style={{ background: "#fafafa", minHeight: "100vh" }}>
      <style>{`
        @keyframes story-fill {
          from { width: 0%; }
          to { width: 100%; }
        }
        .story-fill-anim {
          animation: story-fill ${STORY_DURATION}ms linear forwards;
        }
        .ig-ring {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          padding: 3px;
          background:var(--accent);
          cursor: pointer;
          flex-shrink: 0;
        }
        .ig-ring.viewed {
          background: #d7d7d7;
        }
        .ig-ring-inner {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          padding: 2px;
          background: #fafafa;
        }
        .ig-ring-inner img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          display: block;
        }
      `}</style>

      <div
        style={{
          maxWidth: "640px",
          margin: "0 auto",
          padding: "3rem 1.5rem 5rem",
        }}
      >
        <div
          style={{
            background: "#fff",
            border: "1px solid #ebebeb",
            borderRadius: "16px",
            padding: "2rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "1.6rem",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {snapPreview ? (
                <img
                  src={snapPreview}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                initials
              )}
            </div>
            <div>
              <div
                style={{ fontWeight: 700, fontSize: "1.3rem", color: "#222" }}
              >
                {user.name}
              </div>
              <div
                style={{ fontSize: "0.85rem", color: "#717171", marginTop: 4 }}
              >
                {user.email}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginTop: "1.25rem",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={uploading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "999px",
                padding: "0.6rem 1.1rem",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--accent)",
                cursor: uploading ? "default" : "pointer",
              }}
            >
              {uploading ? "Uploading…" : "Take a Snap"}
            </button>

            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={uploading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "999px",
                padding: "0.6rem 1.1rem",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--accent)",
                cursor: uploading ? "default" : "pointer",
              }}
            >
              {uploading ? "Uploading…" : "Choose from your Gallery"}
            </button>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleSnapSelect}
              style={{ display: "none" }}
            />

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleSnapSelect}
              style={{ display: "none" }}
            />
          </div>
          {uploadError && (
            <div
              style={{
                fontSize: "0.78rem",
                color: "var(--accent)",
                marginTop: "0.5rem",
              }}
            >
              {uploadError}
            </div>
          )}
        </div>

        {mySnaps.length > 0 && (
          <div
            style={{
              background: "#fff",
              border: "1px solid #ebebeb",
              borderRadius: "16px",
              padding: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "#a0a0a0",
                marginBottom: "1rem",
              }}
            >
              My Snaps
            </div>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                overflowX: "auto",
                paddingBottom: "0.25rem",
              }}
            >
              {mySnaps.map((snap, i) => (
                <div
                  key={snap.id ?? i}
                  style={{ textAlign: "center", flexShrink: 0 }}
                >
                  <div
                    className={`ig-ring${viewedIds.has(snap.id) ? " viewed" : ""}`}
                    onClick={() => openStory(i)}
                  >
                    <div className="ig-ring-inner">
                      <img src={snap.image_url} alt="" draggable={false} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          style={{
            background: "#fff",
            border: "1px solid #ebebeb",
            borderRadius: "16px",
            padding: "2rem",
          }}
        >
          <div
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "#a0a0a0",
              marginBottom: "1.25rem",
            }}
          >
            Account details
          </div>

          {fields.map((field, i) => (
            <div
              key={field.label}
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: 600,
                marginBottom: "0.4rem",
                borderBottom:
                  i < field.length - 1 ? "1px solid #ebebeb" : "none",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    color: "#a0a0a0",
                    marginBottom: "0.2rem",
                  }}
                >
                  {field.label}
                </div>

                <div
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    color: field.muted ? "#b0b0b0" : "#222",
                    marginBottom: "0.2rem",
                  }}
                >
                  {field.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login");
            }}
            style={{
              background: "var(--accent)",
              color: "#fff",
              border: "1px solid #ddd",
              borderRadius: "999px",
              padding: "0.75rem 1.5rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {storyOpen && mySnaps.length > 0 && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              height: "100%",
              width: "100%",
              maxWidth: 480,
              background: "#000",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "0.75rem",
                left: "0.75rem",
                right: "0.75rem",
                display: "flex",
                gap: "4px",
                zIndex: 5,
              }}
            >
              {mySnaps.map((snap, i) => (
                <div
                  key={snap.id ?? i}
                  style={{
                    flex: 1,
                    height: 3,
                    borderRadius: 2,
                    background: "rgba(255,255,255,0.35)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    key={i === storyIdx ? `active-${storyIdx}` : `static-${i}`}
                    className={i === storyIdx ? "story-fill-anim" : ""}
                    style={{
                      height: "100%",
                      background: "#fff",
                      width:
                        i < storyIdx
                          ? "100%"
                          : i === storyIdx
                            ? undefined
                            : "0%",
                    }}
                  />
                </div>
              ))}
            </div>

            <div
              style={{
                position: "absolute",
                top: "1.5rem",
                left: "0.75rem",
                right: "0.75rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                zIndex: 5,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "#fff",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                  }}
                >
                  {initials}
                </div>
                {user.name}
              </div>
              <button
                onClick={() => setStoryOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  fontSize: "1.6rem",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                height: "100%",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={mySnaps[storyIdx]?.image_url}
                alt=""
                draggable={false}
                style={{
                  maxHeight: "100%",
                  maxWidth: "100%",
                  objectFit: "contain",
                }}
              />
            </div>

            {mySnaps[storyIdx]?.caption && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "3rem 1.25rem 1.5rem",
                  background:
                    "linear-gradient(to top, rgba(0,0,0,.75), transparent)",
                  color: "#fff",
                  fontSize: "0.85rem",
                  pointerEvents: "none",
                }}
              >
                {mySnaps[storyIdx].caption}
              </div>
            )}

            <div
              onClick={goPrev}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "35%",
                height: "100%",
                zIndex: 4,
                cursor: "pointer",
              }}
            />
            <div
              onClick={goNext}
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "65%",
                height: "100%",
                zIndex: 4,
                cursor: "pointer",
              }}
            />
          </div>
        </div>
      )}
    </main>
  );
}
