import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAllPosts } from "../api/posts";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Mousewheel, Keyboard } from "swiper/modules";
import { EffectCards } from "swiper/modules";
import "swiper/css/effect-cards";
import "swiper/css";
import "swiper/css/pagination";

export default function QuickBites() {
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ["posts"],
    queryFn: getAllPosts,
  });

  const posts = data?.data?.posts || [];

  const [reelOpen, setReelOpen] = useState(false);
  const [reelIdx, setReelIdx] = useState(0);

  const openReel = (idx) => {
    setReelIdx(idx);
    setReelOpen(true);
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
        Couldn't load posts
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
        No posts yet
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

.qb-excerpt {
  margin: 0;
  font-size: .78rem;
  color: #717171;
  text-align: center;
  line-height: 1.4;
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
          background: #000;
        }
        .reel-frame {
          position: relative;
          height: 100%;
          width: 100%;
          overflow: hidden;
          background: #000;
        }
        .reel-outer-controls {
          display: none;
        }
        @media (min-width: 769px) {
          .reel-overlay {
            background: rgba(0, 0, 0, 0.9);
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
            

            .reel-swiper .swiper-pagination-bullets {
              right: 12px;
            }

            .reel-swiper .swiper-pagination-bullet {
              background: white;
              opacity: 0.5;
            }

              .reel-swiper .swiper-pagination-bullet-active {
                opacity: 1;
              }
        }
      `}</style>

      <div style={{ padding: "2rem 0 0.5rem", background: "#fff" }}>
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
            modules={[EffectCards, Mousewheel]}
            slidesPerView={1}
            spaceBetween={30}
            mousewheel={{
              releaseOnEdges: false,
            }}
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

        <p className="qb-excerpt">{posts[activeCard].excerpt}</p>
      </div>

      {/* Reel */}
      {reelOpen && (
        <div className="reel-overlay">
          <Swiper
            direction="vertical"
            modules={[Pagination, Mousewheel, Keyboard]}
            mousewheel={{
              forceToAxis: true,
              releaseOnEdges: false,
            }}
            keyboard={{ enabled: true }}
            pagination={{ clickable: true }}
            initialSlide={reelIdx}
            className="reel-swiper"
            style={{
              height: "100%",
              width: "100%",
            }}
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
