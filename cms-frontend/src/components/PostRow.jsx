import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import PostCard from "./PostCard";

export default function PostRow({ title, posts }) {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  if (!posts?.length) return null;

  return (
    <section style={{ padding: "1.5rem 0" }}>
      <style>{`
        .pr-swiper .swiper-slide {
          height: auto;
        }
      `}</style>

      {/* Heading */}
      <div
        style={{
          padding: "0 1.5rem",
          marginBottom: "1rem",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.4rem",
            fontWeight: 700,
            color: "var(--text)",
            textTransform: "capitalize",
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>

      {/* Swiper Container */}
      <div
        style={{
          position: "relative",
          padding: "0 3rem",
        }}
      >
        {/* Left Arrow */}
        <button
          ref={prevRef}
          aria-label={`Scroll ${title} left`}
          disabled={atStart}
          style={{
            ...arrowBtnStyle,
            position: "absolute",
            left: "0",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            opacity: atStart ? 0.35 : 1,
            cursor: atStart ? "default" : "pointer",
          }}
        >
          ‹
        </button>

        {/* Right Arrow */}
        <button
          ref={nextRef}
          aria-label={`Scroll ${title} right`}
          disabled={atEnd}
          style={{
            ...arrowBtnStyle,
            position: "absolute",
            right: "0",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            opacity: atEnd ? 0.35 : 1,
            cursor: atEnd ? "default" : "pointer",
          }}
        >
          ›
        </button>

        <Swiper
          className="pr-swiper"
          modules={[Navigation]}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          onSlideChange={(swiper) => {
            setAtStart(swiper.isBeginning);
            setAtEnd(swiper.isEnd);
          }}
          onInit={(swiper) => {
            setAtStart(swiper.isBeginning);
            setAtEnd(swiper.isEnd);
          }}
          grabCursor
          loop={false}
          spaceBetween={20}
          slidesPerView={1.2}
          breakpoints={{
            640: { slidesPerView: 2 },
            900: { slidesPerView: 3 },
            1200: { slidesPerView: 4 },
          }}
        >
          {posts.map((post) => (
            <SwiperSlide key={post.id}>
              <PostCard post={post} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

const arrowBtnStyle = {
  width: 48,
  height: 48,
  borderRadius: "50%",
  border: "none",
  background: "rgba(255,255,255,0.95)",
  color: "#222",
  fontSize: "2rem",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  transition: "all 0.2s ease",
};
