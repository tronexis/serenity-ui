'use client';
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import Image from "next/image";
import React, { useState, useEffect } from "react";

interface SwipeCardProps {
  children: React.ReactNode;
  onSendToBack: () => void;
}

function SwipeCard({ children, onSendToBack }: SwipeCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [shadow, setShadow] = useState<string>("0px 0px 15px rgba(0,0,0,0.3)");

  const rotateX = useTransform(y, [-200, 200], [30, -30]);
  const rotateY = useTransform(x, [-200, 200], [-30, 30]);

  useEffect(() => {
    const unsubscribeX = x.onChange(latestX => {
      const latestY = y.get();
      setShadow(`${latestX / 10}px ${latestY / 10}px 15px rgba(0,0,0,0.3)`);
    });

    const unsubscribeY = y.onChange(latestY => {
      const latestX = x.get();
      setShadow(`${latestX / 10}px ${latestY / 10}px 15px rgba(0,0,0,0.3)`);
    });

    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [x, y]);

  function handleDragEnd(_: any, info: PanInfo) {
    const threshold = 150;
    if (Math.abs(info.offset.x) > threshold || Math.abs(info.offset.y) > threshold) {
      onSendToBack();
    } else {
      x.set(0);
      y.set(0);
    }
  }

  return (
    <motion.div
      className="absolute h-80 w-80 cursor-grab rounded-xl"
      style={{ x, y, rotateX, rotateY, boxShadow: shadow }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.5}
      whileTap={{ cursor: "grabbing" }}
      onDragEnd={handleDragEnd}
      whileHover={{ scale: 1.08 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}

interface SwipeCardsProps {
  cards: { id: number; z: number; img: string }[];
}

function SwipeCards({ cards }: SwipeCardsProps) {
  const [cardList, setCardList] = useState(cards);

  const moveToBack = (id: number) => {
    setCardList((prevCards) => {
      const updatedCards = [...prevCards];
      const cardIndex = updatedCards.findIndex((card) => card.id === id);
      const [movedCard] = updatedCards.splice(cardIndex, 1);
      updatedCards.unshift(movedCard);
      return updatedCards;
    });
  };

  return (
    <div className="relative h-80 w-80 mx-auto" style={{ perspective: 1200 }}>
      {cardList.map((card, index) => (
        <SwipeCard key={card.id} onSendToBack={() => moveToBack(card.id)}>
          <motion.div
            className="h-full w-full rounded-xl overflow-hidden"
            animate={{
              rotateZ: (cardList.length - index - 1) * 7,
              scale: 1 + index * 0.1 - cardList.length * 0.1,
              transformOrigin: "80% 80%",
              zIndex: card.z,
            }}
            initial={false}
            transition={{ type: "spring", stiffness: 250, damping: 25 }}
          >
            <Image
              src={card.img}
              alt={`card-${card.id}`}
              layout="fill"
              objectFit="cover"
              className="pointer-events-none"
            />
          </motion.div>
        </SwipeCard>
      ))}
    </div>
  );
}


export default SwipeCards;