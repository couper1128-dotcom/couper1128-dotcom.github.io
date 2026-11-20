"use strict";
const $ = (s) => document.querySelector(s),
  main = $("#main");
const foods = ["김치볶음밥", "크림 파스타", "돈까스"],
  prices = ["₩5,000 이하", "₩5,000~₩10,000", "₩10,000 이상"],
  methods = ["직접 만들기", "편의점", "배달", "식당"];
const meals = [
  {
    ingredients: [
      ["배추김치", 6500, 500, 100, "g"],
      ["쌀", 14000, 4000, 100, "g"],
      ["스팸", 4500, 200, 50, "g"],
      ["계란", 4500, 10, 1, "개"],
      ["대파", 2500, 300, 20, "g"],
      ["식용유", 5500, 900, 15, "mL"],
      ["참기름", 5500, 160, 5, "mL"],
    ],
    home: [
      25,
      "재료 손질 → 볶기 · 계란 조리 → 설거지",
      "지어 둔 밥 기준입니다. 밥을 새로 지으면 약 30분이 더 걸립니다.",
    ],
    store: [
      4500,
      10,
      "스팸 김치볶음밥 컵밥·도시락",
      "편의점 왕복 약 8분, 결제·가열 약 2분.",
    ],
    delivery: [8500, 4000, 3000, 12000, "30~40", "김밥"],
    restaurant: [
      7500,
      "18~20",
      "김치볶음밥",
      "도보 약 10분, 주문부터 음식이 나오기까지 약 8~10분.",
    ],
  },
  {
    ingredients: [
      ["스파게티면", 3500, 500, 100, "g"],
      ["쿠킹크림", 4500, 500, 150, "mL"],
      ["베이컨", 4000, 200, 50, "g"],
      ["깐마늘", 3000, 200, 15, "g"],
      ["올리브유", 9000, 500, 15, "mL"],
    ],
    home: [
      35,
      "재료 손질 · 면 삶기 → 소스와 함께 볶기 → 설거지",
      "올리브유 기준입니다. 같은 구매가로 버터 200g 중 15g을 쓰면 1인분 비용은 ₩3,950입니다.",
    ],
    store: [
      4900,
      12,
      "베이컨 크림 파스타",
      "편의점 왕복 약 8분, 결제·가열 약 3분.",
    ],
    delivery: [11900, 2500, 3000, 14000, "35~45", "사이드 메뉴"],
    restaurant: [
      8900,
      25,
      "베이컨 크림 파스타",
      "도보 약 10분, 주문부터 음식이 나오기까지 약 12~15분.",
    ],
  },
  {
    ingredients: [
      ["돼지고기 등심", 7500, 500, 150, "g"],
      ["빵가루", 2500, 200, 30, "g"],
      ["계란", 4500, 10, 1, "개"],
      ["밀가루", 2500, 500, 30, "g"],
      ["식용유", 5500, 900, 150, "mL"],
      ["돈가스 소스", 3500, 300, 30, "g"],
    ],
    home: [
      50,
      "고기 손질 · 밑간 → 튀김옷 입히기 → 튀기기 → 기름 정리",
      "튀김유 150mL와 소스를 포함한 예시입니다. 밥과 곁들임은 계산에서 제외했습니다.",
    ],
    store: [
      5200,
      11,
      "정통 돈가스 도시락",
      "편의점 왕복 약 8분, 결제·가열 약 2분 30초.",
    ],
    delivery: [12000, 2000, 3000, 14000, "35~50", "음료"],
    restaurant: [
      11000,
      25,
      "로스카츠 정식",
      "도보 약 10분, 주문부터 음식이 나오기까지 약 15분.",
    ],
  },
];

let step = 0,
  food = 0,
  price = -1,
  method = -1;
const won = (n) => "₩" + n.toLocaleString("ko-KR");
const portion = ([, packPrice, packSize, amount]) =>
  Math.round((packPrice * amount) / packSize);
const basket = (meal) =>
  meal.ingredients.reduce((sum, item) => sum + item[1], 0);

function routes(meal) {
  const [homeTime, homeProcess, homeNote] = meal.home;
  const [storePrice, storeTime, product, storeNote] = meal.store;
  const [menu, extra, fee, minimum, deliveryTime, side] = meal.delivery;
  const [restaurantPrice, restaurantTime, dish, restaurantNote] =
    meal.restaurant;

  return [
    {
      amount: meal.ingredients.reduce((sum, item) => sum + portion(item), 0),
      time: homeTime,
      process: homeProcess,
      note: homeNote,
      label: "1인분 재료비",
      lines: meal.ingredients.map((item) => [
        item[0] + " · " + item[3] + item[4],
        won(portion(item)),
      ]),
    },
    {
      amount: storePrice,
      time: storeTime,
      process: "편의점 방문 → 결제 → 가열",
      note: storeNote,
      label: "상품 결제액",
      lines: [[product, won(storePrice)]],
    },
    {
      amount: menu + extra + fee,
      time: deliveryTime,
      process: "메뉴 선택 → 최소 주문 금액 맞추기 → 배달 받기",
      note: "배달 앱의 주문 조건과 배달비는 매장·주소·멤버십에 따라 달라집니다.",
      label: "예상 결제액",
      lines: [
        ["메뉴 가격", won(menu)],
        ["최소 주문 금액", won(minimum)],
        [side + " 추가", won(extra)],
        ["배달비", won(fee)],
      ],
    },
    {
      amount: restaurantPrice,
      time: restaurantTime,
      process: "식당 이동 → 주문 → 음식 받기",
      note: restaurantNote,
      label: "메뉴 결제액",
      lines: [[dish, won(restaurantPrice)]],
    },
  ];
}

function guessResult(amount) {
  const fits = [
    amount <= 5000,
    amount >= 5000 && amount <= 10000,
    amount >= 10000,
  ][price];
  return fits
    ? "예상한 가격 범위에 들어요."
    : amount < [0, 5000, 10000][price]
      ? "예상한 범위보다 낮아요."
      : "예상한 범위보다 높아요.";
}

// 각 장면의 HTML을 불러오고, 선택에 따라 달라지는 값만 채운다.
function render() {
  main.replaceChildren();
  if (step >= 1) {
    main.append($("#choice-context").content.cloneNode(true));
    if (step === 1) main.querySelector(".choice-context").replaceChildren();
  }
  main.append($(`#scene-${step}`).content.cloneNode(true));
  if (step >= 1) {
    main.append($("#back-button").content.cloneNode(true));
  }

  if (step >= 2) {
    const chosenMeal = main.querySelector(".chosen-meal");
    const illustration = chosenMeal.querySelector(".meal-art");
    chosenMeal.hidden = false;
    illustration.classList.add(`art-${food}`);
    illustration.setAttribute("aria-label", `${foods[food]} 로우폴리 3D 일러스트`);
  }
  if (step >= 3) main.querySelector(".summary").hidden = false;
  if (step >= 4) main.querySelector("[data-method-summary]").hidden = false;

  for (const [type, selectedIndex] of [["price", price], ["method", method]]) {
    const options = main.querySelectorAll(`button[data-${type}]`);
    if (options.length === 0) continue;
    options.forEach((button) => {
      button.setAttribute("aria-pressed", Number(button.dataset[type]) === selectedIndex);
    });
    main.querySelector("[data-next]").disabled = selectedIndex < 0;
  }

  const values = { food: foods[food], price: prices[price], method: methods[method] };
  if (step >= 4) {
    const meal = meals[food];
    const selected = routes(meal)[method];
    Object.assign(values, {
      "total-label": selected.label,
      total: won(selected.amount),
      process: selected.process,
      time: `약 ${selected.time}분`,
      note: selected.note,
      guess: guessResult(selected.amount),
    });

    if (step === 4) {
      const items = document.createDocumentFragment();
      selected.lines.forEach(([label, value]) => {
        const row = $("#cost-row").content.cloneNode(true);
        row.querySelector("span").textContent = label;
        row.querySelector("b").textContent = value;
        items.append(row);
      });
      main.querySelector(".ingredients").prepend(items);
    }
    if (step === 5 && method === 0) {
      values.basket = won(basket(meal));
      main.querySelector("[data-basket-row]").hidden = false;
    }
  }

  main.querySelectorAll("[data-value]").forEach((element) => {
    element.textContent = values[element.dataset.value] ?? "";
  });
  main.className = `screen-${step}`;
  main.focus();
}

main.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.food !== undefined) {
    food = +b.dataset.food;
    step = 2;
  } else if (b.dataset.price !== undefined) price = +b.dataset.price;
  else if (b.dataset.method !== undefined) method = +b.dataset.method;
  else if (b.dataset.next !== undefined) {
    step = +b.dataset.next;
    if (step === 0) {
      food = 0;
      price = -1;
      method = -1;
    }
  } else if ("back" in b.dataset) step = Math.max(0, step - 1);
  render();
});

$("#desktop").onclick = () => {
  $("#window").hidden = false;
  $("#desktop").hidden = true;
  render();
};