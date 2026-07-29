import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAllQuickBites } from "../api/quickbites";
import api from "../api/axiosInstance";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, Mousewheel } from "swiper/modules";
import { EffectCards } from "swiper/modules";
import "swiper/css/effect-cards";
import "swiper/css";

export default function QuickBites() {
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["quickbites"],
    queryFn: getAllQuickBites,
  });

  const posts = data?.data?.quickBites || [];

  const [reelOpen, setReelOpen] = useState(false);
  const [reelIdx, setReelIdx] = useState(0);

  const trackVisit = (postId) => {
    const customer = JSON.parse(localStorage.getItem("cms_user") || "null");
    if (!customer?.id) return;

    api
      .post("/api/visit", {
        visitor_id: customer.id,
        page: "QuickBites",
        category: null,
        post_id: postId,
      })
      .catch(() => {});
  };

  const openReel = (idx) => {
    setReelIdx(idx);
    setReelOpen(true);
    trackVisit(posts[idx]?.id);
  };

  if (isLoading)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "6rem",
          color: "#717171",
          fontSize: "0.9rem",
        }}
      >
        Loading…
      </div>
    );

  if (error)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "6rem",
          color: "var(--accent)",
          fontSize: "0.9rem",
        }}
      >
        Couldn't load quick bites
      </div>
    );

  if (posts.length === 0)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "6rem",
          color: "#717171",
          fontSize: "0.9rem",
        }}
      >
        No quick bites yet
      </div>
    );

  return (
    <>
      <style>{`
      .qb-swiper {
  width: 320px;
  height: 430px;
  overflow: hidden;
}

.qb-swiper .swiper-slide {
  border-radius: 20px;
  overflow: hidden;
}

.qb-card {
  width: 100%;
  height: 100%;
  cursor: grab;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(0,0,0,.18);
}

.qb-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

       
        .qb-caption {
  margin: .7rem 0 .2rem;
  font-weight: 700;
  font-size: .9rem;
  color: #222;
  text-align: center;
}


       

@media(min-width:769px){
  .reel-swiper{
    width:calc(92vh * 9 / 16);
    max-width:480px;
    height:92vh;
    border-radius:16px;
  }
}

        .reel-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 50% 30%, var(--accent-dark) 0%, #1a0e08 65%, #000 100%);
        }
        .reel-frame {
          position: relative;
          height: 100%;
          width: 100%;
          overflow: hidden;
          background: radial-gradient(circle at 50% 30%, var(--accent-dark) 0%, #1a0e08 65%, #000 100%);
        }
        .reel-outer-controls {
          display: none;
        }
        @media (min-width: 769px) {
          .reel-overlay {
            background: radial-gradient(circle at 50% 30%, rgba(143, 52, 23, 0.5) 0%, rgba(0,0,0,0.92) 60%);
          }
          .reel-frame {
            height: 92vh;
            width: calc(92vh * 9 / 16);
            max-width: 480px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.6);
          }
          .reel-outer-controls {
            display: flex;
          }
            

            
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 55,
          backdropFilter: isInteracting ? "blur(8px)" : "blur(0px)",
          WebkitBackdropFilter: isInteracting ? "blur(8px)" : "blur(0px)",
          transition: "backdrop-filter 0.35s ease",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 60,
          padding: "2rem 0 0.5rem",
          background: "transparent",
        }}
      >
        <div
          style={{
            margin: "0 auto",
            padding: "0 1.5rem 1rem",
            display: "flex",
            justifyContent: "center",
            marginBottom: "1rem",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "#222",
              textTransform: "uppercase",
            }}
          >
            Quick Bites
          </h2>
        </div>

        <div className="qb-swiper-wrapper">
          <Swiper
            className="qb-swiper"
            modules={[EffectCards]}
            slidesPerView={1}
            spaceBetween={30}
            effect="cards"
            grabCursor
            initialSlide={0}
            cardsEffect={{
              perSlideOffset: 8,
              perSlideRotate: 2,
              rotate: true,
              slideShadows: false,
            }}
            onSlideChange={(swiper) => setActiveCard(swiper.realIndex)}
            onTouchStart={() => setIsInteracting(true)}
            onTouchEnd={() => setIsInteracting(false)}
            onSliderMove={() => setIsInteracting(true)}
          >
            {posts.map((post, index) => (
              <SwiperSlide key={post.id ?? index}>
                <div className="qb-card" onClick={() => openReel(index)}>
                  <img src={post.gif_url} alt={post.title} draggable={false} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <p className="qb-caption">{posts[activeCard].title}</p>
      </div>

      {/* Reel */}
      {reelOpen && (
        <div className="reel-overlay">
          <Swiper
            direction="vertical"
            modules={[Mousewheel, Keyboard]}
            mousewheel={{
              forceToAxis: true,
              releaseOnEdges: false,
            }}
            keyboard={{ enabled: true }}
            initialSlide={reelIdx}
            className="reel-swiper"
            style={{
              height: "100%",
              width: "100%",
            }}
            onSlideChange={(swiper) =>
              trackVisit(posts[swiper.activeIndex]?.id)
            }
          >
            {posts.map((post) => (
              <SwiperSlide key={post.id}>
                <div
                  className="reel-frame"
                  style={{
                    position: "relative",
                    height: "100%",
                    width: "100%",
                  }}
                >
                  {/* Back button */}
                  <button
                    onClick={() => setReelOpen(false)}
                    style={{
                      position: "absolute",
                      top: "1rem",
                      left: "1rem",
                      zIndex: 10,
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.4)",
                      border: "none",
                      color: "#fff",
                      fontSize: "1.4rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    ‹
                  </button>

                  {/* GIF */}
                  <div
                    onClick={() => navigate(`/post/${post.id}`)}
                    style={{
                      height: "100%",
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#000",
                    }}
                  >
                    <img
                      src={post.gif_url}
                      alt={post.title}
                      draggable={false}
                      style={{
                        maxHeight: "100%",
                        maxWidth: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>

                  {/* Caption */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "3rem 1.25rem 1.5rem",
                      background:
                        "linear-gradient(to top, rgba(0,0,0,.75), rgba(0,0,0,.35), transparent)",
                      color: "#fff",
                      pointerEvents: "none",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 .3rem",
                        fontWeight: 700,
                        fontSize: "1rem",
                      }}
                    >
                      {post.title}
                    </p>

                    <p
                      style={{
                        margin: 0,
                        fontSize: ".85rem",
                        opacity: 0.9,
                      }}
                    >
                      {post.excerpt}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </>
  );
}
