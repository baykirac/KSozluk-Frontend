export const particlesConfig = {
  background: {
    color: {
      value: "#ffffff",
    },
  },
  fpsLimit: 120,
  interactivity: {
    events: {
      onClick: {
        enable: true,
      },
      onHover: {
        enable: true,
        mode: "bubble",
      },
      resize: true,
    },
    modes: {
      attract: {
        distance: 200,
        duration: 0.4,
      },
      bubble: {
        distance: 100,
        duration: 0.3,
        opacity: 0.8,
        size: 10,
      },
      push: {
        quantity: 4,
      },
    },
  },
  particles: {
    color: {
      value: "#000fff",
    },
    links: {
      color: "#000fff",
      distance: 150,
      enable: true,
      opacity: 0.7,
      width: 1.5,
    },
    collisions: {
      enable: true,
    },
    move: {
      direction: "none",
      enable: true,
      outMode: "bounce",
      random: true,
      speed: 2,
      straight: true,
    },
    fullScreen: {
      enable: true,
      zIndex: -1,
    },

    number: {
      density: {
        enable: true,
        value_area: 800,
      },
      value: 80,
    },
    opacity: {
      value: 0.5,
    },
    shape: {
      type: "char",
      character: {
        value: ["A", "B", "C", "D"],
        font: "Verdana",
        style: "",
        weight: "400",
        fill: true,
      },
    },
    size: {
      random: true,
      value: 20,
    },
  },
  detectRetina: true,
};
