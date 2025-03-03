var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _lottos, _statistics, _WinningStatistics_instances, calculateBonusNumber_fn, addMatchedCount_fn, _Controller_instances, purchaseLottos_fn, processResults_fn;
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
const CONFIRMATION = {
  YES: "Yes",
  NO: "No"
};
const MIN_UNIT = 1e3;
const MAX_AMOUNT = 1e5;
const LOTTO_NUMBER_MIN = 1;
const LOTTO_NUMBER_MAX = 45;
const LOTTO_SIZE = 6;
const Input = {
  readPurchaseAmount() {
    return new Promise((resolve) => {
      const purchaseAmount = document.querySelector("#purchase-amount").value.trim();
      resolve(purchaseAmount);
    });
  },
  readWinningNumbers() {
    return new Promise((resolve) => {
      const input = prompt("\n> 당첨 번호를 입력해 주세요.").trim();
      resolve(input);
    });
  },
  readBonusNumber() {
    return new Promise((resolve) => {
      const input = prompt("\n> 보너스 번호를 입력해 주세요.").trim();
      resolve(input);
    });
  },
  readRestartConfirm() {
    return new Promise((resolve) => {
      const input = prompt(
        `
> 다시 시작하시겠습니까? (${CONFIRMATION.YES}/${CONFIRMATION.NO}) `
      ).trim();
      resolve(input);
    });
  }
};
const MATCH_KEY = Object.freeze({
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
  FIVE_AND_BONUS: 5.5,
  SIX: 6
});
const MATCH_PRIZE = Object.freeze({
  THREE: 5e3,
  FOUR: 5e4,
  FIVE: 15e5,
  FIVE_AND_BONUS: 3e7,
  SIX: 2e9
});
const Output = {
  printError(errorMessage) {
    console.error(`[ERROR] ${errorMessage}`);
    alert(`[ERROR] ${errorMessage}`);
  },
  printIssuedLottos(lottos) {
    const lottoCount = lottos.length;
    console.log(`${lottoCount}개를 구매했습니다.`);
    console.log(lottos.map((lotto) => lotto.join(", ")).join("\n"));
  },
  printStatistics(statistics) {
    console.log("\n당첨 통계\n--------------------");
    console.log(
      `${MATCH_KEY.THREE}개 일치 (${MATCH_PRIZE.THREE.toLocaleString()}원) - ${statistics.get(MATCH_KEY.THREE).count}개`
    );
    console.log(
      `${MATCH_KEY.FOUR}개 일치 (${MATCH_PRIZE.FOUR.toLocaleString()}원) - ${statistics.get(MATCH_KEY.FOUR).count}개`
    );
    console.log(
      `${MATCH_KEY.FIVE}개 일치 (${MATCH_PRIZE.FIVE.toLocaleString()}원) - ${statistics.get(MATCH_KEY.FIVE).count}개`
    );
    console.log(
      `${MATCH_KEY.FIVE}개 일치, 보너스 볼 일치 (${MATCH_PRIZE.FIVE_AND_BONUS.toLocaleString()}원) - ${statistics.get(MATCH_KEY.FIVE_AND_BONUS).count}개`
    );
    console.log(
      `${MATCH_KEY.SIX}개 일치 (${MATCH_PRIZE.SIX.toLocaleString()}원) - ${statistics.get(MATCH_KEY.SIX).count}개`
    );
  },
  printProfitRatio(profitRatio) {
    console.log(`총 수익률은 ${profitRatio}%입니다.`);
  },
  displayWinningStatistics(winningStatistics) {
    const modalOverlay = document.querySelector("#modal-overlay");
    const statisticsModal = document.querySelector("#winning-statistics-modal");
    const resultsTable = document.querySelector(".lotto-table tbody");
    const profitRateText = document.querySelector(".winnind-rate");
    const closeModalButton = document.querySelector("#close-modal");
    if (!modalOverlay || !statisticsModal || !resultsTable || !profitRateText) {
      console.error("❌ 필요한 요소를 찾을 수 없습니다!");
      return;
    }
    modalOverlay.style.display = "flex";
    statisticsModal.style.display = "block";
    resultsTable.innerHTML = "";
    const prizeData = [
      { match: 3, prize: "5,000", key: "THREE" },
      { match: 4, prize: "50,000", key: "FOUR" },
      { match: 5, prize: "1,500,000", key: "FIVE" },
      { match: "5+보너스볼", prize: "30,000,000", key: "FIVE_AND_BONUS" },
      { match: 6, prize: "2,000,000,000", key: "SIX" }
    ];
    prizeData.forEach(({ match, prize, key }) => {
      var _a;
      const count = ((_a = winningStatistics.statistics.get(key)) == null ? void 0 : _a.count) ?? 0;
      const row = document.createElement("tr");
      row.innerHTML = `
            <td>${match}개</td>
            <td>${prize}원</td>
            <td>${count}개</td>
        `;
      resultsTable.appendChild(row);
    });
    const profitRatio = winningStatistics.calculateProfitRatio();
    profitRateText.textContent = `당신의 총 수익률은 ${profitRatio}%입니다.`;
    closeModalButton.addEventListener("click", () => {
      modalOverlay.style.display = "none";
      statisticsModal.style.display = "none";
    });
    document.querySelector("#restart-btn").addEventListener("click", () => {
      modalOverlay.style.display = "none";
      statisticsModal.style.display = "none";
    });
  }
};
const getUniqueRandomNumbers = (min, max, count) => {
  const range = Array.from(
    { length: max - min + 1 },
    (_, index) => min + index
  );
  const shuffled = range.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).sort((a, b) => a - b);
};
const issueLottos = (purchaseAmount) => {
  const lottoCount = purchaseAmount / MIN_UNIT;
  return Array.from({ length: lottoCount }, () => {
    return getUniqueRandomNumbers(
      LOTTO_NUMBER_MIN,
      LOTTO_NUMBER_MAX,
      LOTTO_SIZE
    ).sort((a, b) => a - b);
  });
};
const countMatchingNumbers = (referenceArray, testArray) => {
  return testArray.filter((number) => referenceArray.includes(number)).length;
};
class WinningStatistics {
  constructor(lottos) {
    __privateAdd(this, _WinningStatistics_instances);
    __privateAdd(this, _lottos, []);
    __privateAdd(this, _statistics, /* @__PURE__ */ new Map([
      [MATCH_KEY.THREE, { count: 0, amount: MATCH_PRIZE.THREE }],
      [MATCH_KEY.FOUR, { count: 0, amount: MATCH_PRIZE.FOUR }],
      [MATCH_KEY.FIVE, { count: 0, amount: MATCH_PRIZE.FIVE }],
      [
        MATCH_KEY.FIVE_AND_BONUS,
        { count: 0, amount: MATCH_PRIZE.FIVE_AND_BONUS }
      ],
      [MATCH_KEY.SIX, { count: 0, amount: MATCH_PRIZE.SIX }]
    ]));
    __privateSet(this, _lottos, lottos);
  }
  get statistics() {
    return __privateGet(this, _statistics);
  }
  calculateProfitRatio(purchaseAmount) {
    const profitAmount = Array.from(__privateGet(this, _statistics).values()).reduce(
      (sum, { count, amount }) => sum + count * amount,
      0
    );
    const PERCENTAGE = 100;
    const DECIMAL_POINT = 1;
    return (profitAmount / purchaseAmount * PERCENTAGE).toFixed(
      DECIMAL_POINT
    );
  }
  calculateWinningResults(winningNumbers, bonusNumber) {
    __privateGet(this, _lottos).forEach((lotto) => {
      const matchedCount = countMatchingNumbers(winningNumbers, lotto);
      if (matchedCount === MATCH_KEY.FIVE) {
        __privateMethod(this, _WinningStatistics_instances, addMatchedCount_fn).call(this, __privateMethod(this, _WinningStatistics_instances, calculateBonusNumber_fn).call(this, lotto, bonusNumber));
        return;
      }
      __privateMethod(this, _WinningStatistics_instances, addMatchedCount_fn).call(this, matchedCount);
    });
  }
}
_lottos = new WeakMap();
_statistics = new WeakMap();
_WinningStatistics_instances = new WeakSet();
calculateBonusNumber_fn = function(lotto, bonusNumber) {
  if (lotto.includes(bonusNumber)) return MATCH_KEY.FIVE_AND_BONUS;
  return MATCH_KEY.FIVE;
};
addMatchedCount_fn = function(matchedCount) {
  if (matchedCount >= MATCH_KEY.THREE) {
    __privateGet(this, _statistics).set(matchedCount, {
      ...__privateGet(this, _statistics).get(matchedCount),
      count: __privateGet(this, _statistics).get(matchedCount).count + 1
    });
  }
};
class LottoGame {
  issueLottos(purchaseAmount) {
    return issueLottos(purchaseAmount);
  }
  calculateResults(lottos, winningNumbers, bonusNumber) {
    const winningStatistics = new WinningStatistics(lottos);
    winningStatistics.calculateWinningResults(winningNumbers, bonusNumber);
    return winningStatistics;
  }
}
const PURCHASE_AMOUNT_ERROR_MESSAGES = Object.freeze({
  NOT_A_NUMBER: "구입 금액은 숫자여야 합니다.",
  BELOW_MINIMUM: `구입 금액은 ${MIN_UNIT.toLocaleString()}원 이상이어야 합니다.`,
  INVALID_UNIT: `구입 금액은 ${MIN_UNIT.toLocaleString()}원 단위여야 합니다.`,
  ABOVE_MAXIMUM: `구입 금액은 ${MAX_AMOUNT.toLocaleString()}원 이하여야 합니다.`
});
const throwIfInvalid = (condition, errorMessage) => {
  if (condition) {
    throw new Error(errorMessage);
  }
};
const checkIsNumber = (purchaseAmount) => {
  throwIfInvalid(
    Number.isNaN(purchaseAmount),
    PURCHASE_AMOUNT_ERROR_MESSAGES.NOT_A_NUMBER
  );
};
const checkValidMinValue = (purchaseAmount) => {
  throwIfInvalid(
    purchaseAmount < MIN_UNIT,
    PURCHASE_AMOUNT_ERROR_MESSAGES.BELOW_MINIMUM
  );
};
const checkValidUnit = (purchaseAmount) => {
  throwIfInvalid(
    purchaseAmount % MIN_UNIT !== 0,
    PURCHASE_AMOUNT_ERROR_MESSAGES.INVALID_UNIT
  );
};
const checkValidMaxValue = (purchaseAmount) => {
  throwIfInvalid(
    purchaseAmount > MAX_AMOUNT,
    PURCHASE_AMOUNT_ERROR_MESSAGES.ABOVE_MAXIMUM
  );
};
const validatePurchaseAmount = (input) => {
  const purchaseAmount = Number(input);
  checkIsNumber(purchaseAmount);
  checkValidMinValue(purchaseAmount);
  checkValidUnit(purchaseAmount);
  checkValidMaxValue(purchaseAmount);
  return purchaseAmount;
};
class Controller {
  constructor() {
    __privateAdd(this, _Controller_instances);
    this.lottoGame = new LottoGame();
    this.purchaseAmount = null;
    this.lottos = [];
  }
  async start(winningNumbers = null, bonusNumber = null) {
    if (this.purchaseAmount === null) {
      const isValid = await __privateMethod(this, _Controller_instances, purchaseLottos_fn).call(this);
      if (!isValid) {
        return null;
      }
    }
    if (!winningNumbers || bonusNumber === null) {
      Output.printError("당첨 번호를 입력해야 합니다.");
      return null;
    }
    return __privateMethod(this, _Controller_instances, processResults_fn).call(this, winningNumbers, bonusNumber);
  }
}
_Controller_instances = new WeakSet();
purchaseLottos_fn = async function() {
  const purchaseInput = await Input.readPurchaseAmount();
  let purchaseAmount;
  try {
    purchaseAmount = validatePurchaseAmount(purchaseInput);
  } catch (error) {
    Output.printError(error.message);
    document.querySelector("#purchase-amount").value = "";
    return false;
  }
  const lottoCount = Math.floor(purchaseAmount / 1e3);
  if (lottoCount < 1) {
    Output.printError("구매 금액이 부족합니다.");
    document.querySelector("#purchase-amount").value = "";
    return false;
  }
  this.purchaseAmount = purchaseAmount;
  this.lottos = issueLottos(purchaseAmount);
  Output.printIssuedLottos(this.lottos);
  return true;
};
processResults_fn = function(winningNumbers, bonusNumber) {
  const winningStatistics = this.lottoGame.calculateResults(
    this.lottos,
    winningNumbers,
    bonusNumber
  );
  if (!winningStatistics || !winningStatistics.statistics) {
    console.error(
      "❌ winningStatistics가 제대로 생성되지 않음!",
      winningStatistics
    );
    return null;
  }
  Output.printStatistics(winningStatistics.statistics);
  Output.printProfitRatio(
    winningStatistics.calculateProfitRatio(this.purchaseAmount)
  );
  Output.displayWinningStatistics(winningStatistics);
  return winningStatistics;
};
document.addEventListener("DOMContentLoaded", () => {
  const purchaseInput = document.querySelector("#purchase-amount");
  const purchaseButton = document.querySelector("#purchase-btn");
  const lottoListContainer = document.querySelector("#lotto-list");
  const winningSection = document.querySelector(".get-numbers");
  const checkResultButton = document.querySelector("#check-result-btn");
  const controller = new Controller();
  if (!checkResultButton) {
    console.error("❌ checkResultButton을 찾을 수 없습니다!");
    return;
  }
  checkResultButton.style.display = "block";
  purchaseButton.addEventListener("click", () => {
    const inputAmount = purchaseInput.value.trim();
    let purchaseAmount;
    try {
      purchaseAmount = Number(inputAmount);
      if (isNaN(purchaseAmount) || purchaseAmount < 1e3 || purchaseAmount % 1e3 !== 0) {
        throw new Error("구입 금액은 1,000원 단위여야 합니다.");
      }
    } catch (error) {
      Output.printError(error.message);
      purchaseInput.value = "";
      return;
    }
    const lottos = issueLottos(purchaseAmount);
    displayLottos(lottos);
    winningSection.style.display = "block";
    checkResultButton.style.display = "block";
    controller.purchaseAmount = purchaseAmount;
    controller.lottos = lottos;
    purchaseInput.value = "";
  });
  checkResultButton.addEventListener("click", async () => {
    const { winningNumbers, bonusNumber } = getWinningNumbers();
    if (!winningNumbers || bonusNumber === null) {
      console.warn("⚠️ 당첨 번호 입력이 올바르지 않음!");
      return;
    }
    const winningStatistics = await controller.start(
      winningNumbers,
      bonusNumber
    );
    if (!winningStatistics) {
      console.error("❌ winningStatistics가 생성되지 않음! 모달 표시 불가");
      return;
    }
    Output.displayWinningStatistics(winningStatistics);
  });
  function displayLottos(lottos) {
    lottoListContainer.innerHTML = `
      <p>총 ${lottos.length}개를 구매하였습니다.</p>
      <ul class="text-body">
        ${lottos.map((lotto) => `<li>🎟️ ${lotto.join(", ")}</li>`).join("")}
      </ul>
    `;
  }
  function getWinningNumbers() {
    const winningInputs = document.querySelectorAll(".winning-number");
    const bonusInput = document.querySelector(".bonus-number input");
    if (!winningInputs.length || !bonusInput) {
      Output.printError(
        "당첨 번호 또는 보너스 번호 입력 필드를 찾을 수 없습니다."
      );
      return { winningNumbers: null, bonusNumber: null };
    }
    const winningNumbers = [...winningInputs].map((input) => {
      var _a;
      return ((_a = input == null ? void 0 : input.value) == null ? void 0 : _a.trim()) ?? "";
    }).filter((val) => val !== "").map(Number).filter((num) => !isNaN(num) && num >= 1 && num <= 45);
    let bonusNumber = Number(bonusInput.value.trim());
    if (winningNumbers.length !== 6 || isNaN(bonusNumber) || bonusNumber < 1 || bonusNumber > 45) {
      Output.printError(
        "올바른 형식으로 당첨 번호와 보너스 번호를 입력해주세요."
      );
      return { winningNumbers: null, bonusNumber: null };
    }
    if (winningNumbers.includes(bonusNumber)) {
      Output.printError("보너스 번호는 당첨 번호와 중복될 수 없습니다.");
      return { winningNumbers: null, bonusNumber: null };
    }
    return { winningNumbers, bonusNumber };
  }
});
