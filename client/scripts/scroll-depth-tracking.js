// Automatically stop the attention timer after this time
const ATTENTION_INTERVAL = 15000;

// These events re/start the attention timer
const ATTENTION_EVENTS = [
  "load",
  "click",
  "focus",
  "scroll",
  "mousemove",
  "touchstart",
  "touchend",
  "touchcancel",
  "touchleave",
];

// These events pause the attention timer
const ATTENTION_LOST_EVENTS = ["blur"];

// These events will trigger the exit callback
const PAGE_EXIT_EVENTS = ["beforeunload", "unload", "pagehide"];

const defaultAttentionTimeOptions = {
  onExit: () => {},
  debug: false,
};

class AttentionTime {
  constructor(options) {
    this.options = { ...defaultAttentionTimeOptions, ...options };

    this.totalAttentionTime = 0;
    this.hasExited = false;

    this.init();
  }

  init() {
    ATTENTION_EVENTS.forEach((event) => {
      window.addEventListener(event, this.startAttention.bind(this));
    });

    ATTENTION_LOST_EVENTS.forEach((event) => {
      window.addEventListener(event, this.endAttention.bind(this));
    });

    PAGE_EXIT_EVENTS.forEach((event) => {
      window.addEventListener(event, this.handleExit.bind(this));
    });

    document.addEventListener(
      "visibilitychange",
      this.handleVisibilityChange.bind(this)
    );

    const videoPlayers = document.querySelectorAll("video");

    videoPlayers.forEach((element) => {
      element.addEventListener(
        "playing",
        this.startConstantAttention.bind(this)
      );

      element.addEventListener("pause", this.endConstantAttention.bind(this));

      element.addEventListener("ended", this.endConstantAttention.bind(this));
    });
  }

  startAttention(event) {
    clearTimeout(this.attentionTimeout);

    if (!this.startAttentionTime) {
      this.startAttentionTime = Date.now();
    }

    this.attentionTimeout = setTimeout(
      this.endAttention.bind(this, { type: "timeout" }),
      ATTENTION_INTERVAL
    );

    if (this.options.debug) {
      console.log("AttentionTime start", { event: event.type }); // eslint-disable-line no-console
    }
  }

  endAttention(event) {
    if (this.startAttentionTime) {
      clearTimeout(this.attentionTimeout);

      this.totalAttentionTime = this.getAttentionTime();
      this.startAttentionTime = null;
    }

    if (this.options.debug) {
      console.log("AttentionTime end", {
        event: event.type,
        time: this.totalAttentionTime,
      }); // eslint-disable-line no-console
    }
  }

  startConstantAttention() {
    this.constantAttentionInterval = setInterval(
      this.startAttention.bind(this),
      ATTENTION_INTERVAL
    );
  }

  endConstantAttention(event) {
    this.endAttention(event);
    clearInterval(this.constantAttentionInterval);
  }

  getAttentionTime() {
    let currentAttentionTime = 0;

    if (this.startAttentionTime) {
      currentAttentionTime = Math.round(
        (Date.now() - this.startAttentionTime) / 1000
      );
    }

    return this.totalAttentionTime + currentAttentionTime;
  }

  handleVisibilityChange(event) {
    if (document.visibilityState === "hidden") {
      this.endAttention(event);
    } else {
      this.startAttention(event);
    }
  }

  handleExit(event) {
    if (this.hasExited) {
      return;
    }

    this.endAttention(event);

    if (this.options.debug) {
      console.log("AttentionTime", {
        event: event.type,
        time: this.totalAttentionTime,
      }); // eslint-disable-line no-console
    }

    this.options.onExit(this.totalAttentionTime);

    this.hasExited = true;
  }
}

// Create markers at each of these percentage points
const DEPTH_MARKERS = [25, 50, 75, 100];

const defaultScrollDepthOptions = {
  onScroll: () => {},
  target: "body",
  debug: false,
};

class ScrollDepth {
  constructor(options) {
    this.options = { ...defaultScrollDepthOptions, ...options };

    this.init();
  }

  init() {
    const target = document.querySelector(this.options.target);

    if (target && "IntersectionObserver" in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this)
      );

      target.style.position = "relative";

      DEPTH_MARKERS.forEach((percentage) => {
        const marker = document.createElement("div");
        marker.className = "n-tracking-scroll-depth-marker";
        marker.style.position = "absolute";
        marker.style.top = `${percentage}%`;
        marker.style.bottom = "0";
        marker.style.width = "100%";
        marker.style.zIndex = "-1";
        marker.setAttribute("data-scroll-depth", percentage);

        target.appendChild(marker);

        this.observer.observe(marker);
      });
    }
  }

  handleIntersection(changes) {
    changes.forEach((change) => {
      if (change.isIntersecting || change.intersectionRatio > 0) {
        const marker = change.target;
        const scrollDepth = marker.getAttribute("data-scroll-depth");

        this.options.onScroll(scrollDepth);

        if (this.options.debug) {
          console.log("ScrollDepth", { marker: scrollDepth }); // eslint-disable-line no-console
        }

        if (marker.parentNode) {
          marker.parentNode.removeChild(marker);
        }

        this.observer.unobserve(marker);
      }
    });
  }
}

const onExit = (attentionTime) => {
  if (window.oTracking) {
    window.oTracking.event({
      detail: {
        category: "page",
        action: "interaction",
        context: {
          attention: {
            total: attentionTime,
          },
        },
      },
    });
  }
};

const attention = new AttentionTime({ options: {}, onExit });
const onScroll = (scrollDepth) => {
  if (window.oTracking) {
    window.oTracking.event({
      detail: {
        category: "page",
        action: "scrolldepth",
        meta: {
          percentagesViewed: scrollDepth,
          attention: attention.getAttentionTime(),
        },
      },
    });
  }
};

new ScrollDepth({ target: "main", onScroll });
