const cryptoData = {
  btc: {
    name: "Bitcoin",
    address: "bc1qkf348jd50a79x24n2k66smt5fdu2rfgxm5ay05",
    qr: "../assets/images/donate/crypto/don_btc.webp",
  },
  eth: {
    name: "Ethereum",
    address: "0xDE770a99E83C65580559Df8906e7AA67D05d1e38",
    qr: "../assets/images/donate/crypto/don_eth.webp",
  },
  usdt: {
    name: "USDT",
    address: "TKda8czdqBh5fv7sXsJomsipdvwEejz2Dp",
    qr: "../assets/images/donate/crypto/don_usdt.webp",
  },
  usdc: {
    name: "USDC",
    address: "0xDE770a99E83C65580559Df8906e7AA67D05d1e38",
    qr: "../assets/images/donate/crypto/don_usdc.webp",
  },
  sol: {
    name: "Solana",
    address: "CRBSqcc7c2WGjQ2ax14do4xPcyo64CfG2czUrhBUaD7W",
    qr: "../assets/images/donate/crypto/don_sol.webp",
  },
  ton: {
    name: "TON",
    address: "UQC1_ojsCg-1wLML1CWhfJwlez0EJ9_NT7mhSrjCjt5YBx2a",
    qr: "../assets/images/donate/crypto/don_ton.webp",
  },
  ltc: {
    name: "Litecoin",
    address: "ltc1q7v2dsxn6aeakwf3s5ze6wq4xs4r0628c06pfwp",
    qr: "../assets/images/donate/crypto/don_ltc.webp",
  },
  doge: {
    name: "Dogecoin",
    address: "DJXSpE2suF9PyxeEVs5Ncnng3SRHoC3e2X",
    qr: "../assets/images/donate/crypto/don_doge.webp",
  },
  trx: {
    name: "Tron",
    address: "TKda8czdqBh5fv7sXsJomsipdvwEejz2Dp",
    qr: "../assets/images/donate/crypto/don_trx.webp",
  },
};

const modal = document.getElementById("crypto-modal");
const modalTitle = document.getElementById("crypto-modal-title");
const modalQr = document.getElementById("crypto-modal-qr");
const modalAddress = document.getElementById("crypto-modal-address");
const copyButton = document.getElementById("crypto-copy-button");

let currentAddress = "";

function openCryptoModal(cryptoKey) {
  const item = cryptoData[cryptoKey];
  if (!item || !modal || !modalTitle || !modalQr || !modalAddress) return;

  currentAddress = item.address;

  modalTitle.textContent = item.name;
  modalQr.src = item.qr;
  modalQr.alt = `${item.name} QR`;
  modalAddress.textContent = item.address;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

function closeCryptoModal() {
  if (!modal) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");

  currentAddress = "";
}

async function copyCurrentAddress() {
  if (!currentAddress) return;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(currentAddress);
    } else {
      const textarea = document.createElement("textarea");

      textarea.value = currentAddress;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      textarea.style.left = "-9999px";

      document.body.appendChild(textarea);

      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);

      document.execCommand("copy");

      document.body.removeChild(textarea);
    }

    if (!copyButton) return;

    copyButton.textContent = "Copied";

    window.setTimeout(() => {
      copyButton.textContent = "Copy address";
    }, 1200);
  } catch {
    if (!copyButton) return;

    copyButton.textContent = "Copy failed";

    window.setTimeout(() => {
      copyButton.textContent = "Copy address";
    }, 1200);
  }
}

document.querySelectorAll(".crypto-card").forEach((card) => {
  card.addEventListener("click", () => {
    const cryptoKey = card.dataset.crypto;
    openCryptoModal(cryptoKey);
  });
});

document.querySelectorAll("[data-modal-close]").forEach((element) => {
  element.addEventListener("click", closeCryptoModal);
});

if (copyButton) {
  copyButton.addEventListener("click", copyCurrentAddress);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCryptoModal();
  }
});