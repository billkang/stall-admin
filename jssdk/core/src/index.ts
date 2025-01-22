import { defineCustomElement } from './defineCustomElement';

export * from './context';

export function defineJSSDK(name: string, options: Record<string, any>) {
  const jsSDKName = `stall-jssdk-${name}`;

  if (customElements.get(jsSDKName)) {
    console.error(`*** customElements '${jsSDKName}' already existed!`);
    return;
  }

  if (!options.styles) {
    options.styles = [];
  }

  options.styles.push(`
.stall-dot-loading {
  position: relative;
  display: inline-block;
  width: 56px;
  height: 8px;
  transform-style: preserve-3d;
  perspective: 200px;
}
.stall-dot-loading-item {
  position: absolute;
  top: 0;
  left: 50%;
  width: 8px;
  height: 8px;
  background-color: rgb(var(--primary-6));
  border-radius: var(--border-radius-circle);
  transform: translateX(-50%) scale(0);
  animation: stall-dot-loading 2s cubic-bezier(0, 0, 1, 1) infinite forwards;
}
.stall-dot-loading-item:nth-child(2) {
  background-color: rgb(var(--primary-5));
  animation-delay: 400ms;
}
.stall-dot-loading-item:nth-child(3) {
  background-color: rgb(var(--primary-4));
  animation-delay: 800ms;
}
.stall-dot-loading-item:nth-child(4) {
  background-color: rgb(var(--primary-4));
  animation-delay: 1200ms;
}
.stall-dot-loading-item:nth-child(5) {
  background-color: rgb(var(--primary-2));
  animation-delay: 1600ms;
}
/* prettier-ignore */
@keyframes stall-dot-loading {
  /* prettier-ignore */
  0% {
    transform: translate3D(-48.621%, 0, -0.985px) scale(0.511);
  }
  2.778% {
    transform: translate3D(-95.766%, 0, -0.94px) scale(0.545);
  }
  5.556% {
    transform: translate3D(-140%, 0, -0.866px) scale(0.6);
  }
  8.333% {
    transform: translate3D(-179.981%, 0, -0.766px) scale(0.675);
  }
  11.111% {
    transform: translate3D(-214.492%, 0, -0.643px) scale(0.768);
  }
  13.889% {
    transform: translate3D(-242.487%, 0, -0.5px) scale(0.875);
  }
  16.667% {
    transform: translate3D(-263.114%, 0, -0.342px) scale(0.993);
  }
  19.444% {
    transform: translate3D(-275.746%, 0, -0.174px) scale(1.12);
  }
  22.222% {
    transform: translate3D(-280%, 0, 0px) scale(1.25);
  }
  25% {
    transform: translate3D(-275.746%, 0, 0.174px) scale(1.38);
  }
  27.778% {
    transform: translate3D(-263.114%, 0, 0.342px) scale(1.507);
  }
  30.556% {
    transform: translate3D(-242.487%, 0, 0.5px) scale(1.625);
  }
  33.333% {
    transform: translate3D(-214.492%, 0, 0.643px) scale(1.732);
  }
  36.111% {
    transform: translate3D(-179.981%, 0, 0.766px) scale(1.825);
  }
  38.889% {
    transform: translate3D(-140%, 0, 0.866px) scale(1.9);
  }
  41.667% {
    transform: translate3D(-95.766%, 0, 0.94px) scale(1.955);
  }
  44.444% {
    transform: translate3D(-48.621%, 0, 0.985px) scale(1.989);
  }
  47.222% {
    transform: translate3D(0%, 0, 1px) scale(2);
  }
  50% {
    transform: translate3D(48.621%, 0, 0.985px) scale(1.989);
  }
  52.778% {
    transform: translate3D(95.766%, 0, 0.94px) scale(1.955);
  }
  55.556% {
    transform: translate3D(140%, 0, 0.866px) scale(1.9);
  }
  58.333% {
    transform: translate3D(179.981%, 0, 0.766px) scale(1.825);
  }
  61.111% {
    transform: translate3D(214.492%, 0, 0.643px) scale(1.732);
  }
  63.889% {
    transform: translate3D(242.487%, 0, 0.5px) scale(1.625);
  }
  66.667% {
    transform: translate3D(263.114%, 0, 0.342px) scale(1.507);
  }
  69.444% {
    transform: translate3D(275.746%, 0, 0.174px) scale(1.38);
  }
  72.222% {
    transform: translate3D(280%, 0, 0px) scale(1.25);
  }
  75% {
    transform: translate3D(275.746%, 0, -0.174px) scale(1.12);
  }
  77.778% {
    transform: translate3D(263.114%, 0, -0.342px) scale(0.993);
  }
  80.556% {
    transform: translate3D(242.487%, 0, -0.5px) scale(0.875);
  }
  83.333% {
    transform: translate3D(214.492%, 0, -0.643px) scale(0.768);
  }
  86.111% {
    transform: translate3D(179.981%, 0, -0.766px) scale(0.675);
  }
  88.889% {
    transform: translate3D(140%, 0, -0.866px) scale(0.6);
  }
  91.667% {
    transform: translate3D(95.766%, 0, -0.94px) scale(0.545);
  }
  94.444% {
    transform: translate3D(48.621%, 0, -0.985px) scale(0.511);
  }
  97.222% {
    transform: translate3D(0%, 0, -1px) scale(0.5);
  }
}
.stall-spin {
  display: inline-block;
}
.stall-spin-with-tip {
  text-align: center;
}
.stall-spin-icon {
  color: rgb(var(--primary-6));
  font-size: 20px;
}
.stall-spin-tip {
  margin-top: 6px;
  color: rgb(var(--primary-6));
  font-weight: 500;
  font-size: 14px;
}
.stall-spin-mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 11;
  text-align: center;
  background-color: var(--color-spin-layer-bg);
  transition: opacity 0.1s cubic-bezier(0, 0, 1, 1);
  user-select: none;
}
.stall-spin-loading {
  position: relative;
  user-select: none;
}
.stall-spin-loading .stall-spin-mask-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 12;
  transform: translate(-50%, -50%);
}
.stall-spin-loading .stall-spin-children::after {
  opacity: 1;
  pointer-events: auto;
}

.stall-result {
  box-sizing: border-box;
  width: 100%;
  padding: 32px 32px 24px;
}
.stall-result-icon {
  margin-bottom: 16px;
  font-size: 20px;
  text-align: center;
}
.stall-result-icon-tip {
  display: flex;
  width: 45px;
  height: 45px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin: 0 auto;
}
.stall-result-icon-custom .stall-result-icon-tip {
  font-size: 45px;
  color: inherit;
  width: unset;
  height: unset;
}
.stall-result-icon-success .stall-result-icon-tip {
  color: rgb(var(--success-6));
  background-color: var(--color-success-light-1);
}
.stall-result-icon-error .stall-result-icon-tip {
  color: rgb(var(--danger-6));
  background-color: var(--color-danger-light-1);
}
.stall-result-icon-info .stall-result-icon-tip {
  color: rgb(var(--primary-6));
  background-color: var(--color-primary-light-1);
}
.stall-result-icon-warning .stall-result-icon-tip {
  color: rgb(var(--warning-6));
  background-color: var(--color-warning-light-1);
}
.stall-result-icon-404,
.stall-result-icon-403,
.stall-result-icon-500 {
  padding-top: 24px;
}
.stall-result-icon-404 .stall-result-icon-tip,
.stall-result-icon-403 .stall-result-icon-tip,
.stall-result-icon-500 .stall-result-icon-tip {
  width: 92px;
  height: 92px;
  line-height: 92px;
}
.stall-result-title {
  color: var(--color-text-1);
  font-weight: 500;
  font-size: 14px;
  line-height: 1.5715;
  text-align: center;
}
.stall-result-subtitle {
  color: var(--color-text-2);
  font-size: 14px;
  line-height: 1.5715;
  text-align: center;
}
.stall-result-extra {
  margin-top: 20px;
  text-align: center;
}
.stall-result-content {
  margin-top: 20px;
}`);

  customElements.define(jsSDKName, defineCustomElement(options));
}
