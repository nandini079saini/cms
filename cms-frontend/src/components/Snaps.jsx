import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllSnaps, reactToSnap } from "../api/snaps";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from "swiper/modules";
import "swiper/css/effect-cards";
import "swiper/css";

const REACTIONS = [
  { type: "like", emoji: "👍", countKey: "likes" },
  { type: "smile", emoji: "😄", countKey: "smiles" },
  { type: "tongue", emoji: "😛", countKey: "tongues" },
];

export default function Snaps() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["snaps"], queryFn: getAllSnaps });
  const snaps = data?.data?.snaps || [];
  const [activeCard, setActiveCard] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [activeIdx, setActiveIdx] = useState(null);

  const customer = JSON.parse(localStorage.getItem("cms_user") || "null");

  const handleReact = async (snapId, type) => {
    if (!customer?.id) return;
    await reactToSnap(snapId, customer.id, type);
    queryClient.invalidateQueries({ queryKey: ["snaps"] });
  };

  if (!snaps.length) return null;

  return (
    <>
      <style>{`
      .sn-swiper {
  width: 320px;
  height: 430px;
  overflow: hidden;
}

.sn-swiper .swiper-slide {
  border-radius: 20px;
  overflow: hidden;
}

.sn-card {
  width: 100%;
  height: 100%;
  cursor: grab;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(0,0,0,.18);
}

.sn-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}


        .sn-caption {
  margin: .7rem 0 .2rem;
  font-weight: 700;
  font-size: .9rem;
  color: #222;
  text-align: center;
}

.sn-excerpt {
  margin: 0;
  font-size: .78rem;
  color: #717171;
  text-align: center;
  line-height: 1.4;
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
            COMMUNITY SNAPS
          </h2>
        </div>

        <div className="sn-swiper-wrapper">
          <Swiper
            className="sn-swiper"
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
            {snaps.map((snap, index) => (
              <SwiperSlide key={snap.id ?? index}>
                <div className="sn-card" onClick={() => setActiveIdx(index)}>
                  <img
                    src={snap.image_url}
                    alt={snap.customer_name}
                    draggable={false}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <p className="sn-caption">{snaps[activeCard]?.customer_name}</p>

        <p className="sn-excerpt">{snaps[activeCard]?.caption}</p>
      </div>

      {activeIdx !== null && (
        <div
          onClick={() => setActiveIdx(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: "relative", maxWidth: 420, width: "90%" }}
          >
            <button
              onClick={() => setActiveIdx(null)}
              style={{
                position: "absolute",
                top: -40,
                right: 0,
                background: "none",
                border: "none",
                color: "#fff",
                fontSize: "1.6rem",
                cursor: "pointer",
              }}
            >
              ×
            </button>

            <div
              style={{
                color: "#fff",
                fontSize: "0.85rem",
                marginBottom: "0.5rem",
              }}
            >
              {snaps[activeIdx].customer_name}
            </div>

            <img
              src={snaps[activeIdx].image_url}
              alt=""
              style={{ width: "100%", borderRadius: 12, display: "block" }}
            />

            {snaps[activeIdx].caption && (
              <p
                style={{
                  color: "#eee",
                  fontSize: "0.85rem",
                  marginTop: "0.5rem",
                }}
              >
                {snaps[activeIdx].caption}
              </p>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "1.5rem",
                marginTop: "1.25rem",
              }}
            >
              {REACTIONS.map((r) => (
                <button
                  key={r.type}
                  onClick={() => handleReact(snaps[activeIdx].id, r.type)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.2rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: "1.6rem" }}>{r.emoji}</span>
                  <span style={{ fontSize: "0.75rem", color: "#ccc" }}>
                    {snaps[activeIdx][r.countKey]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
