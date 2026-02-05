import React from "react";

const Skeleton = ({ width = "100%", height = "20px", borderRadius = "8px", style = {} }) => {
  return (
    <div style={{
      ...styles.skeleton,
      width,
      height,
      borderRadius,
      ...style
    }}>
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}
      </style>
    </div>
  );
};

const styles = {
  skeleton: {
    background: "linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite linear",
  }
};

export default Skeleton;
