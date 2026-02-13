import React from "react";
import styles from "./Card.module.css";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className, ...rest }) => {
  return (
    <div className={`${styles.card} ${className ?? ""}`} {...rest}>
      {children}
    </div>
  );
};

export default Card;