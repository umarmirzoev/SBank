function resolveCardProduct(cardWrapper) {
  const title = cardWrapper?.querySelector(".card-wrapper-info h3")?.textContent?.trim().toLowerCase() || "";

  if (title.includes("visa gold")) {
    return "visa-gold";
  }

  if (title.includes("mastercard platinum")) {
    return "mastercard-platinum";
  }

  if (title.includes("милли")) {
    return "milli";
  }

  return null;
}

function buildRedirectTarget(productKey) {
  return `app-cards.html?issueCard=${encodeURIComponent(productKey)}`;
}

function handleCardOrderClick(cardWrapper) {
  const productKey = resolveCardProduct(cardWrapper);
  if (!productKey) {
    return;
  }

  const redirectTarget = buildRedirectTarget(productKey);
  window.location.href = `login.html?redirect=${encodeURIComponent(redirectTarget)}`;
}

function initPublicCardsPage() {
  document.querySelectorAll(".card-wrapper").forEach((cardWrapper) => {
    const button = cardWrapper.querySelector(".card-wrapper-btn");
    if (!button) {
      return;
    }

    button.type = "button";
    button.addEventListener("click", () => handleCardOrderClick(cardWrapper));
  });
}

document.addEventListener("DOMContentLoaded", initPublicCardsPage);
