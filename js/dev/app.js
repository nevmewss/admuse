(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function getHash() {
  if (location.hash) {
    return location.hash.replace("#", "");
  }
}
function setHash(hash) {
  hash = hash ? `#${hash}` : window.location.href.split("#")[0];
  history.pushState("", "", hash);
}
let slideUp = (target, duration = 500, showmore = 0) => {
  if (!target.classList.contains("--slide")) {
    target.classList.add("--slide");
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + "ms";
    target.style.height = `${target.offsetHeight}px`;
    target.offsetHeight;
    target.style.overflow = "hidden";
    target.style.height = showmore ? `${showmore}px` : `0px`;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    window.setTimeout(() => {
      target.hidden = !showmore ? true : false;
      !showmore ? target.style.removeProperty("height") : null;
      target.style.removeProperty("padding-top");
      target.style.removeProperty("padding-bottom");
      target.style.removeProperty("margin-top");
      target.style.removeProperty("margin-bottom");
      !showmore ? target.style.removeProperty("overflow") : null;
      target.style.removeProperty("transition-duration");
      target.style.removeProperty("transition-property");
      target.classList.remove("--slide");
      document.dispatchEvent(new CustomEvent("slideUpDone", {
        detail: {
          target
        }
      }));
    }, duration);
  }
};
let slideDown = (target, duration = 500, showmore = 0) => {
  if (!target.classList.contains("--slide")) {
    target.classList.add("--slide");
    target.hidden = target.hidden ? false : null;
    showmore ? target.style.removeProperty("height") : null;
    let height = target.offsetHeight;
    target.style.overflow = "hidden";
    target.style.height = showmore ? `${showmore}px` : `0px`;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    target.offsetHeight;
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + "ms";
    target.style.height = height + "px";
    target.style.removeProperty("padding-top");
    target.style.removeProperty("padding-bottom");
    target.style.removeProperty("margin-top");
    target.style.removeProperty("margin-bottom");
    window.setTimeout(() => {
      target.style.removeProperty("height");
      target.style.removeProperty("overflow");
      target.style.removeProperty("transition-duration");
      target.style.removeProperty("transition-property");
      target.classList.remove("--slide");
      document.dispatchEvent(new CustomEvent("slideDownDone", {
        detail: {
          target
        }
      }));
    }, duration);
  }
};
let slideToggle = (target, duration = 500) => {
  if (target.hidden) {
    return slideDown(target, duration);
  } else {
    return slideUp(target, duration);
  }
};
let bodyLockStatus = true;
let bodyLockToggle = (delay = 500) => {
  if (document.documentElement.hasAttribute("data-fls-scrolllock")) {
    bodyUnlock(delay);
  } else {
    bodyLock(delay);
  }
};
let bodyUnlock = (delay = 500) => {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-fls-lp]");
    setTimeout(() => {
      lockPaddingElements.forEach((lockPaddingElement) => {
        lockPaddingElement.style.paddingRight = "";
      });
      document.body.style.paddingRight = "";
      document.documentElement.removeAttribute("data-fls-scrolllock");
    }, delay);
    bodyLockStatus = false;
    setTimeout(function() {
      bodyLockStatus = true;
    }, delay);
  }
};
let bodyLock = (delay = 500) => {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-fls-lp]");
    const lockPaddingValue = window.innerWidth - document.body.offsetWidth + "px";
    lockPaddingElements.forEach((lockPaddingElement) => {
      lockPaddingElement.style.paddingRight = lockPaddingValue;
    });
    document.body.style.paddingRight = lockPaddingValue;
    document.documentElement.setAttribute("data-fls-scrolllock", "");
    bodyLockStatus = false;
    setTimeout(function() {
      bodyLockStatus = true;
    }, delay);
  }
};
function dataMediaQueries(array, dataSetValue) {
  const media = Array.from(array).filter((item) => item.dataset[dataSetValue]).map((item) => {
    const [value, type = "max"] = item.dataset[dataSetValue].split(",");
    return { value, type, item };
  });
  if (media.length === 0) return [];
  const breakpointsArray = media.map(({ value, type }) => `(${type}-width: ${value}px),${value},${type}`);
  const uniqueQueries = [...new Set(breakpointsArray)];
  return uniqueQueries.map((query) => {
    const [mediaQuery, mediaBreakpoint, mediaType] = query.split(",");
    const matchMedia = window.matchMedia(mediaQuery);
    const itemsArray = media.filter((item) => item.value === mediaBreakpoint && item.type === mediaType);
    return { itemsArray, matchMedia };
  });
}
const gotoBlock = (targetBlock, noHeader = false, speed = 500, offsetTop = 0) => {
  const targetBlockElement = document.querySelector(targetBlock);
  if (targetBlockElement) {
    let headerItem = "";
    let headerItemHeight = 0;
    if (noHeader) {
      headerItem = "header.header";
      const headerElement = document.querySelector(headerItem);
      if (!headerElement.classList.contains("--header-scroll")) {
        headerElement.style.cssText = `transition-duration: 0s;`;
        headerElement.classList.add("--header-scroll");
        headerItemHeight = headerElement.offsetHeight;
        headerElement.classList.remove("--header-scroll");
        setTimeout(() => {
          headerElement.style.cssText = ``;
        }, 0);
      } else {
        headerItemHeight = headerElement.offsetHeight;
      }
    }
    if (document.documentElement.hasAttribute("data-fls-menu-open")) {
      bodyUnlock();
      document.documentElement.removeAttribute("data-fls-menu-open");
    }
    let targetBlockElementPosition = targetBlockElement.getBoundingClientRect().top + scrollY;
    targetBlockElementPosition = headerItemHeight ? targetBlockElementPosition - headerItemHeight : targetBlockElementPosition;
    targetBlockElementPosition = offsetTop ? targetBlockElementPosition - offsetTop : targetBlockElementPosition;
    window.scrollTo({
      top: targetBlockElementPosition,
      behavior: "smooth"
    });
  }
};
function menuInit() {
  document.addEventListener("click", function(e) {
    if (bodyLockStatus && e.target.closest("[data-fls-menu]")) {
      bodyLockToggle();
      document.documentElement.toggleAttribute("data-fls-menu-open");
    }
  });
}
document.querySelector("[data-fls-menu]") ? window.addEventListener("load", menuInit) : null;
document.addEventListener("DOMContentLoaded", () => {
  const steps = document.querySelectorAll(".quiz__step");
  const finalBlock = document.querySelector(".quiz__step-6");
  const nextBtn = document.querySelector(".quiz__next");
  const navButtons = document.querySelectorAll(".quiz__ask");
  let currentStep = 0;
  function showStep(index) {
    steps.forEach((step, i) => {
      step.style.display = i === index ? "block" : "none";
    });
    finalBlock.style.display = "none";
    currentStep = index;
    toggleNextButton();
    navButtons.forEach((btn, i) => {
      btn.classList.toggle("act", i === index);
    });
    if (currentStep === 5) {
      nextBtn.style.display = "none";
    } else {
      nextBtn.style.display = "inline-block";
    }
  }
  function isStepValid() {
    const step = steps[currentStep];
    const textInputs = step.querySelectorAll("input[type='text']");
    if (textInputs.length && ![...textInputs].every((input) => input.value.trim() !== "")) return false;
    const radios = step.querySelectorAll("input[type='radio']");
    if (radios.length && ![...radios].some((radio) => radio.checked)) return false;
    const checkboxes = step.querySelectorAll("input[type='checkbox']");
    if (checkboxes.length && ![...checkboxes].some((chk) => chk.checked)) return false;
    return true;
  }
  function toggleNextButton() {
    nextBtn.disabled = !isStepValid();
  }
  function highlightErrors() {
    const step = steps[currentStep];
    step.querySelectorAll("input[type='text']").forEach((input) => {
      if (input.value.trim() === "") {
        input.classList.add("error");
      } else {
        input.classList.remove("error");
      }
    });
    const radios = step.querySelectorAll("input[type='radio']");
    if (radios.length && ![...radios].some((r) => r.checked)) {
      radios.forEach((radio) => {
        const label = radio.closest("label.quiz__var") || radio.closest("label.quiz__var-radio");
        if (label) label.classList.add("error");
      });
    } else {
      radios.forEach((radio) => {
        const label = radio.closest("label.quiz__var") || radio.closest("label.quiz__var-radio");
        if (label) label.classList.remove("error");
      });
    }
    const checkboxes = step.querySelectorAll("input[type='checkbox']");
    if (checkboxes.length && ![...checkboxes].some((chk) => chk.checked)) {
      checkboxes.forEach((chk) => {
        const label = chk.closest("label.quiz__var-check");
        if (label) label.classList.add("error");
      });
    } else {
      checkboxes.forEach((chk) => {
        const label = chk.closest("label.quiz__var-check");
        if (label) label.classList.remove("error");
      });
    }
  }
  steps.forEach((step) => {
    step.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", () => {
        input.classList.remove("error");
        const label = input.closest("label");
        if (label) label.classList.remove("error");
        toggleNextButton();
      });
      input.addEventListener("change", () => {
        input.classList.remove("error");
        const label = input.closest("label");
        if (label) label.classList.remove("error");
        toggleNextButton();
      });
    });
  });
  nextBtn.addEventListener("click", () => {
    if (!isStepValid()) {
      highlightErrors();
      return;
    }
    if (currentStep < steps.length - 1) {
      showStep(currentStep + 1);
    } else {
      steps.forEach((step) => step.style.display = "none");
      finalBlock.style.display = "block";
      nextBtn.style.display = "none";
    }
  });
  showStep(0);
});
document.addEventListener("DOMContentLoaded", () => {
  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  const mask = "+380(__) ___-__-__";
  phoneInputs.forEach((input) => {
    input.addEventListener("focus", onFocus);
    input.addEventListener("input", onInput);
    input.addEventListener("blur", onBlur);
    input.addEventListener("keydown", onKeyDown);
    input.addEventListener("click", onClick);
    input.addEventListener("paste", onPaste);
  });
  function onFocus(e) {
    const input = e.target;
    if (input.value.trim() === "") {
      input.value = mask;
    }
    moveCaretToFirstUnderscore(input);
  }
  function onInput(e) {
    formatPhone(e.target);
  }
  function onKeyDown(e) {
    const input = e.target;
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      let start = input.selectionStart;
      let end = input.selectionEnd;
      let digits = getDigits(input.value);
      if (end > start) {
        let before = getDigits(input.value.slice(0, start));
        let after = getDigits(input.value.slice(end));
        digits = before + after;
      } else if (e.key === "Backspace") {
        digits = digits.slice(0, -1);
      } else if (e.key === "Delete") {
        digits = digits.slice(1);
      }
      input.value = buildMaskedValue(digits);
      moveCaretToFirstUnderscore(input);
    }
  }
  function onClick(e) {
    const input = e.target;
    moveCaretToFirstUnderscore(input);
  }
  function onBlur(e) {
    const input = e.target;
    if (input.value === mask) {
      input.value = "";
    }
  }
  function onPaste(e) {
    e.preventDefault();
    const input = e.target;
    let pasted = (e.clipboardData || window.clipboardData).getData("text");
    let digits = pasted.replace(/\D/g, "").replace(/^380/, "");
    digits = digits.slice(0, 9);
    input.value = buildMaskedValue(digits);
    moveCaretToFirstUnderscore(input);
  }
  function formatPhone(input) {
    let digits = getDigits(input.value);
    digits = digits.slice(0, 9);
    input.value = buildMaskedValue(digits);
    moveCaretToFirstUnderscore(input);
  }
  function getDigits(value) {
    let digits = value.replace(/\D/g, "");
    return digits.replace(/^380/, "");
  }
  function buildMaskedValue(digits) {
    let result = "";
    let index = 0;
    for (let char of mask) {
      if (char === "_") {
        if (index < digits.length) {
          result += digits[index];
          index++;
        } else {
          result += "_";
        }
      } else {
        result += char;
      }
    }
    return result;
  }
  function moveCaretToFirstUnderscore(input) {
    let pos = input.value.indexOf("_");
    if (pos === -1) pos = input.value.length;
    requestAnimationFrame(() => {
      input.setSelectionRange(pos, pos);
    });
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".blog__column");
  const paginationWrapper = document.querySelector(".blog__pagination");
  const itemsPerPage = 9;
  let currentPage = 1;
  const totalPages = Math.ceil(items.length / itemsPerPage);
  function createPagination() {
    paginationWrapper.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement("button");
      button.type = "button";
      button.classList.add("blog__pag");
      button.textContent = i;
      if (i === currentPage) button.classList.add("active");
      button.addEventListener("click", () => {
        showPage(i);
      });
      paginationWrapper.appendChild(button);
    }
  }
  function showPage(page) {
    currentPage = page;
    items.forEach((item) => item.style.display = "none");
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    for (let i = start; i < end && i < items.length; i++) {
      items[i].style.display = "block";
    }
    createPagination();
    history.pushState(null, "", `?page=${page}`);
  }
  const urlParams = new URLSearchParams(window.location.search);
  const pageParam = parseInt(urlParams.get("page"));
  if (pageParam && pageParam > 0 && pageParam <= totalPages) {
    currentPage = pageParam;
  }
  createPagination();
  showPage(currentPage);
});
export {
  getHash as a,
  bodyUnlock as b,
  setHash as c,
  dataMediaQueries as d,
  slideUp as e,
  slideToggle as f,
  gotoBlock as g,
  slideDown as s
};
