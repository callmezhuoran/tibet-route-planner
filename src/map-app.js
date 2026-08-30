import * as d3 from "d3";
import L from "leaflet";
import {
  ArrowRight, BedDouble, CalendarDays, Camera, Car, Clock3, createIcons, Focus,
  Hotel, MapPin, Maximize2, Route, ShieldAlert, Utensils, X
} from "lucide";
import "leaflet/dist/leaflet.css";
import "./map.css";

const ATTRACTION_IMAGES = import.meta.glob("../assets/attractions/*.jpg", {
  eager: true,
  query: "?url",
  import: "default"
});

function imageFor(fileName) {
  return ATTRACTION_IMAGES[`../assets/attractions/${fileName}`];
}

const UI_ICONS = {
  ArrowRight, BedDouble, CalendarDays, Camera, Car, Clock3, Focus, Hotel,
  MapPin, Maximize2, Route, ShieldAlert, Utensils, X
};

createIcons({ icons: UI_ICONS });

const ROUTES = [
  {
    id: "g318",
    label: "G318 川藏南线",
    summary: "自然景观主线：峡谷、湖泊、冰川、森林一路进入拉萨",
    meta: "成都 · 康定 · 理塘 · 然乌 · 波密 · 林芝 · 拉萨",
    coordinates: [
      [104.07, 30.67], [103.04, 30.01], [102.23, 29.91], [101.96, 30.05],
      [101.50, 30.04], [101.01, 30.03], [100.27, 30.00], [99.11, 30.00],
      [98.60, 29.68], [97.84, 29.67], [96.92, 30.05], [96.73, 29.45],
      [95.77, 29.86], [94.73, 29.77], [94.36, 29.65], [93.97, 30.00],
      [91.13, 29.66]
    ],
    labelAt: [98.25, 29.05]
  },
  {
    id: "genyen-route",
    label: "格聂南线",
    shortLabel: "格聂南线",
    summary: "从理塘离开 G318，经格聂镇、格聂之眼与格聂南坡，在巴塘附近接回 G318",
    meta: "理塘 · 铁匠山 · 格聂镇 · 格聂之眼 · 格木 · 巴塘",
    coordinates: [
      [100.27, 30.00], [100.12, 29.88], [99.96, 29.75], [99.82, 29.70],
      [99.76, 29.80], [99.60, 29.70], [99.43, 29.54], [99.24, 29.56],
      [99.11, 30.00]
    ],
    labelAt: [99.58, 29.52]
  },
  {
    id: "g317",
    label: "G317 川藏北线",
    summary: "藏地人文主线：羌寨、寺院、白塔与高原城镇密度更高",
    meta: "成都 · 汶川 · 马尔康 · 甘孜 · 德格 · 昌都 · 那曲 · 拉萨",
    coordinates: [
      [104.07, 30.67], [103.62, 31.00], [103.59, 31.47], [102.22, 31.90],
      [101.69, 32.90], [100.68, 31.39], [99.99, 31.63], [98.58, 31.81],
      [98.22, 31.50], [97.18, 31.14], [95.60, 31.42], [94.70, 31.48],
      [93.79, 31.89], [92.30, 31.48], [91.68, 31.48], [91.13, 29.66]
    ],
    labelAt: [98.55, 32.15]
  },
  {
    id: "west-loop",
    label: "川西小环线",
    summary: "成都起止的轻量环线：雪山、藏寨、草原与旅拍点集中",
    meta: "成都 · 四姑娘山 · 丹巴 · 塔公 · 新都桥 · 康定",
    coordinates: [
      [104.07, 30.67], [103.62, 31.00], [102.84, 31.10], [101.89, 30.88],
      [101.51, 30.32], [101.50, 30.04], [101.96, 30.05], [102.23, 29.91],
      [103.04, 30.01], [104.07, 30.67]
    ],
    labelAt: [102.55, 30.58]
  },
  {
    id: "shangri-la-spur",
    label: "理塘经亚丁至香格里拉支线",
    shortLabel: "亚丁 · 香格里拉线",
    summary: "从 G318 理塘南下，经稻城亚丁、乡城进入香格里拉的自然与人文支线",
    meta: "理塘 · 稻城 · 亚丁 · 乡城 · 香格里拉",
    coordinates: [
      [100.27, 30.00], [100.17, 29.42], [100.30, 29.04], [100.32, 28.47],
      [100.08, 28.66], [99.80, 28.93], [99.29, 28.71], [99.70, 27.83]
    ],
    labelAt: [100.04, 28.64]
  },
  {
    id: "g214-return",
    label: "G214 滇藏回接线",
    shortLabel: "G214 回接线",
    summary: "从云南香格里拉经奔子栏、德钦、盐井，在芒康重新接回 G318",
    meta: "香格里拉 · 奔子栏 · 德钦 · 盐井 · 芒康",
    coordinates: [
      [99.70, 27.83], [99.03, 28.24], [98.91, 28.49], [98.73, 28.75],
      [98.60, 29.08], [98.46, 29.35], [98.60, 29.68]
    ],
    labelAt: [98.82, 28.86]
  },
  {
    id: "yubeng-spur",
    label: "德钦至雨崩支线",
    shortLabel: "雨崩线",
    summary: "从 G214 德钦、飞来寺附近转向西当，再通过接驳与徒步进入雨崩村",
    meta: "德钦 · 飞来寺 · 西当 · 雨崩村",
    coordinates: [
      [98.91, 28.49], [98.88, 28.44], [98.82, 28.39], [98.794, 28.392]
    ],
    labelAt: [98.82, 28.43]
  },
  {
    id: "abuji-reference",
    label: "阿布吉措位置参考",
    shortLabel: "阿布吉措 · 禁入",
    summary: "位于香格里拉附近，但不在 G214 路边；2026 年官方通告明确禁止进入该未开发区域",
    meta: "香格里拉 · 小中甸 · 阿布吉措（当前禁入）",
    coordinates: [
      [99.70, 27.83], [99.82, 27.75], [99.9084, 27.6694]
    ],
    labelAt: [99.84, 27.71]
  },
  {
    id: "ganheba-reference",
    label: "丽江至干河坝位置参考",
    shortLabel: "干河坝 · 禁入",
    summary: "位于丽江玉龙雪山南麓，不属于本次向北进入德钦的 G214 滇藏路线，且当前未开放",
    meta: "香格里拉 · 丽江方向 · 玉龙雪山干河坝（当前禁入）",
    coordinates: [
      [99.70, 27.83], [100.02, 27.50], [100.20, 27.20], [100.22, 27.07]
    ],
    labelAt: [100.09, 27.33]
  },
  {
    id: "nanji-spur",
    label: "香格里拉至南极洛支线",
    shortLabel: "南极洛线",
    summary: "从香格里拉转向维西、巴迪乡；最后一段路况和徒步强度都需单独确认",
    meta: "香格里拉 · 维西 · 巴迪乡 · 南极洛",
    coordinates: [
      [99.70, 27.83], [99.56, 27.48], [99.29, 27.18], [99.12, 27.52], [99.05, 27.67]
    ],
    labelAt: [99.32, 27.35]
  },
  {
    id: "namtso-spur",
    label: "拉萨至纳木错支线",
    shortLabel: "纳木错线",
    summary: "从拉萨北上，经羊八井、当雄前往纳木错的高海拔往返支线",
    meta: "拉萨 · 羊八井 · 当雄 · 纳木错",
    coordinates: [
      [91.13, 29.66], [90.88, 29.86], [90.55, 30.10], [91.10, 30.48],
      [90.85, 30.60], [90.57, 30.72]
    ],
    labelAt: [90.80, 30.24]
  },
  {
    id: "yamdrok-spur",
    label: "拉萨至羊卓雍措支线",
    shortLabel: "羊卓雍措线",
    summary: "从拉萨沿拉萨河谷南下，经曲水、岗巴拉山口抵达羊卓雍措",
    meta: "拉萨 · 曲水 · 岗巴拉山口 · 羊卓雍措",
    coordinates: [
      [91.13, 29.66], [90.74, 29.36], [90.65, 29.10], [90.64, 28.96]
    ],
    labelAt: [90.84, 29.24]
  },
  {
    id: "final-route",
    mode: "final-locked",
    featuredOnly: true,
    label: "2026 最终路线",
    shortLabel: "最终路线",
    summary: "成都经四姑娘山、丹巴与塔公接入 G318，格聂一日往返后分住左贡、八宿，10月5日中午前后抵达拉萨",
    meta: "成都 · 四姑娘山 · 理塘 · 格聂之眼往返 · 姊妹湖 · 左贡 · 八宿 · 林芝 · 拉萨",
    coordinates: [
      [104.07, 30.67], [103.62, 31.00], [103.12, 30.98], [102.84, 31.10],
      [101.89, 30.88], [101.51, 30.32], [101.50, 30.04], [101.01, 30.03],
      [100.27, 30.00], [99.70, 30.08], [99.11, 30.00], [98.60, 29.68],
      [97.84, 29.67], [96.92, 30.05],
      [96.73, 29.45], [95.77, 29.86], [94.73, 29.77], [94.36, 29.65],
      [93.97, 30.00], [91.13, 29.66]
    ],
    labelAt: [97.35, 30.36]
  },
  {
    id: "final-genyen-daytrip",
    mode: "final-locked",
    featuredOnly: true,
    label: "格聂之眼一日小团往返",
    shortLabel: "格聂小团往返",
    summary: "主车留在理塘，乘当地营运车辆经铁匠山、格聂花海往返格聂之眼",
    meta: "理塘 · 铁匠山 · 格聂花海 · 格聂之眼 · 原路返回理塘",
    coordinates: [
      [100.27, 30.00], [100.12, 29.88], [99.96, 29.75], [99.82, 29.70], [99.76, 29.80]
    ],
    labelAt: [99.92, 29.66]
  }
];

const SPOTS = [
  {
    name: "拉萨人文组", type: "人文", grade: "A", location: "拉萨市城关区", route: "拉萨收尾",
    note: "布达拉宫外景、大昭寺与八廓街组成最强人文组，机位集中，适合轻量拍照。",
    visitTime: "1.5–2 天", stay: "建议拉萨住 2 晚", stayTone: "yes",
    effort: "轻量步行", image: imageFor("potala-palace.jpg"), coordinates: [91.13, 29.66], callout: [-116, -22]
  },
  {
    name: "羊卓雍措", type: "自然", grade: "A", location: "山南市浪卡子县", route: "拉萨南侧支线",
    note: "蓝绿色圣湖与曲折湖岸是拉萨周边最稳定的自然大景，观景台即可完成主要拍摄。",
    visitTime: "5–7 小时", stay: "当天返回拉萨", stayTone: "no",
    effort: "短距离步行", image: imageFor("yamdrok-lake.jpg"), coordinates: [90.64, 28.96], callout: [-106, 38]
  },
  {
    name: "纳木错", type: "自然", grade: "A", location: "拉萨市当雄县方向", route: "拉萨北侧支线",
    note: "高原大湖与念青唐古拉山同框，但海拔、往返车程和天气波动都高于羊卓雍措。",
    visitTime: "1 天", stay: "优先拉萨往返，不住湖边", stayTone: "no",
    effort: "少走路，但海拔高", image: imageFor("namtso-lake.jpg"), coordinates: [90.57, 30.72], callout: [-104, -72]
  },
  {
    name: "雅鲁藏布大峡谷", type: "自然", grade: "A", location: "林芝市米林市派镇方向", route: "林芝支线",
    note: "峡谷、雅江河谷和南迦巴瓦峰同框，是林芝方向的顶级自然景观组。",
    visitTime: "0.5–1 天", stay: "拍晨昏建议索松村 1 晚", stayTone: "yes",
    effort: "景区车为主", image: imageFor("yarlung-tsangpo-canyon.jpg"), coordinates: [94.90, 29.56], callout: [-48, 54]
  },
  {
    name: "鲁朗", type: "综合", grade: "A", location: "林芝市巴宜区鲁朗镇", route: "G318 顺路",
    note: "森林、牧场、雪山与藏式木屋兼顾自然和人像，视野柔和，步行要求低。",
    visitTime: "3–5 小时", stay: "可住鲁朗 1 晚，非必须", stayTone: "optional",
    effort: "轻量步行", image: imageFor("lulang-forest.jpg"), coordinates: [94.74, 29.77], callout: [-116, -52]
  },
  {
    name: "巴松措", type: "自然", grade: "B", location: "林芝市工布江达县", route: "G318 短支线",
    note: "湖泊、森林与湖心岛组合成熟，适合在林芝前往拉萨途中作为省力停靠点。",
    visitTime: "3–5 小时", stay: "可住结巴村 1 晚，非必须", stayTone: "optional",
    effort: "景区车 + 短步行", image: imageFor("basum-lake.jpg"), coordinates: [93.97, 30.00], callout: [-68, -82]
  },
  {
    name: "然乌湖", type: "自然", grade: "A", location: "昌都市八宿县然乌镇", route: "G318 顺路",
    note: "湖面、雪山、公路和晨昏光影集中，是 318 自然线最值得留出完整时段的节点。",
    visitTime: "3–5 小时", stay: "建议然乌住 1 晚", stayTone: "yes",
    effort: "路边观景为主", image: imageFor("ranwu-lake.jpg"), coordinates: [96.73, 29.45], callout: [28, 22]
  },
  {
    name: "米堆 / 来古冰川", type: "自然", grade: "A", location: "然乌至波密一带", route: "G318 支线二选一",
    note: "冰川、冰湖、森林和村落高差明显；按天气与路况二选一，不安排同日双刷。",
    visitTime: "4–6 小时", stay: "住然乌或波密 1 晚", stayTone: "yes",
    effort: "中等步行", image: imageFor("midui-glacier.jpg"), coordinates: [96.38, 29.33], callout: [22, 70]
  },
  {
    name: "波密河谷", type: "自然", grade: "B", location: "林芝市波密县", route: "G318 顺路",
    note: "雪山、河谷、森林与城镇层次完整，适合把连续长途驾驶拆成舒缓的一晚。",
    visitTime: "2–4 小时", stay: "建议波密住 1 晚", stayTone: "yes",
    effort: "路边观景为主", image: imageFor("bomi-valley.jpg"), coordinates: [95.77, 29.86], callout: [30, -72]
  },
  {
    name: "怒江 72 拐", type: "自然", grade: "C", location: "昌都市八宿县", route: "G318 顺路",
    note: "盘山公路和怒江峡谷的路线感强，适合短暂停车留影，不必额外占用半天。",
    visitTime: "20–40 分钟", stay: "无需当地过夜，住八宿", stayTone: "no",
    effort: "停车观景", image: imageFor("nujiang-72-turns.jpg"), coordinates: [97.04, 30.05], callout: [84, -22]
  },
  {
    name: "塔公 / 新都桥", type: "综合", grade: "A", location: "甘孜州康定市", route: "川西环线 / G318 前段",
    note: "草原、寺院、雪山和秋季光影兼顾自然与旅拍，是川西段最适合拍人的组合。",
    visitTime: "0.5–1 天", stay: "建议新都桥住 1 晚", stayTone: "yes",
    effort: "轻量步行", image: imageFor("tagong-xinduqiao.jpg"), coordinates: [101.52, 30.18], callout: [-80, -78]
  },
  {
    name: "稻城亚丁", type: "自然", grade: "A", location: "甘孜州稻城县香格里拉镇", route: "亚丁 · 香格里拉支线",
    note: "三神山、洛绒牛场和高山草甸属于川西南顶级自然景观；牛奶海、五色海长线体力压力大，可只走景区车加短线观景。",
    visitTime: "短线 1 天", stay: "香格里拉镇至少住 2 晚", stayTone: "yes",
    effort: "短线可控；长线高强度", image: imageFor("daocheng-yading.jpg"), coordinates: [100.32, 28.47], callout: [24, 18]
  },
  {
    name: "格聂 / 格聂之眼", type: "自然", grade: "A", location: "甘孜州理塘县格聂镇，理塘至巴塘之间", route: "格聂南线 · G318 替代段",
    note: "格聂群峰、格聂之眼、草原花海和高原村落构成川西顶级雪山景观；它不属于滇藏线，可从理塘进入并在巴塘接回 G318。",
    visitTime: "完整穿越 2 天", stay: "沿线至少住 1 晚", stayTone: "yes",
    effort: "观景短步行；全线高海拔越野", image: imageFor("genyen-eye.jpg"), coordinates: [99.7593, 29.7983], callout: [22, -78]
  },
  {
    name: "甘孜 / 德格", type: "人文", grade: "A", location: "甘孜州甘孜县、德格县", route: "G317 北线",
    note: "寺院、白塔、藏式城镇与德格印经院构成 317 的核心价值，人文密度明显高于 318。",
    visitTime: "2–3 天", stay: "甘孜、德格建议各住 1 晚", stayTone: "yes",
    effort: "轻至中等步行", image: imageFor("derge.jpg"), coordinates: [99.23, 31.70], callout: [24, -58]
  },
  {
    name: "四姑娘山 / 丹巴", type: "综合", grade: "B", location: "阿坝州小金县、甘孜州丹巴县", route: "川西环线",
    note: "极高山群峰与嘉绒藏寨互补；可选观景公路和低强度沟口，不必走长线。",
    visitTime: "1.5–2 天", stay: "至少安排 1 晚", stayTone: "yes",
    effort: "可压缩为轻量", image: imageFor("siguniang-danba.jpg"), coordinates: [102.60, 31.02], callout: [30, 28]
  },
  {
    name: "理塘", type: "综合", grade: "B", location: "甘孜州理塘县", route: "G318 / 亚丁支线入口",
    note: "毛垭大草原、海子山路景与县城藏地人文兼具，是从 G318 转向稻城前很顺路的观景和休整节点。",
    visitTime: "2–4 小时", stay: "主线可不住；进格聂前可住", stayTone: "optional",
    effort: "路边观景 + 轻量步行", image: imageFor("litang.jpg"), coordinates: [100.27, 30.00], callout: [-92, 24]
  },
  {
    name: "香格里拉", type: "综合", grade: "B", location: "云南省迪庆州香格里拉市", route: "远线扩展 · 滇西北",
    note: "独克宗古城、松赞林寺与纳帕海兼顾人文和自然；同行有人去过，可压缩成中转加半日拍照。",
    visitTime: "0.5–1 天", stay: "建议住 1 晚", stayTone: "yes",
    effort: "轻至中等步行", image: imageFor("shangri-la.jpg"), coordinates: [99.70, 27.83], callout: [-122, -62]
  },
  {
    name: "雨崩", type: "自然", grade: "A", location: "云南省迪庆州德钦县云岭乡雨崩村", route: "G214 德钦支线 · 徒步目的地",
    note: "从滇藏线德钦、飞来寺附近转入西当，再通过接驳与徒步进入雨崩；官方规划线路约 45 公里、2–3 天，神瀑和冰湖仍属于高强度高海拔路线。",
    visitTime: "至少 2–3 天", stay: "雨崩村至少住 2 晚", stayTone: "yes",
    effort: "高海拔长距离徒步，本团慎选", image: imageFor("yubeng-village.jpg"), coordinates: [98.794, 28.392], callout: [24, -70]
  },
  {
    name: "阿布吉措", type: "自然", grade: "B", status: "当前禁入", location: "云南省迪庆州香格里拉市小中甸镇", route: "香格里拉支线 · 位置参考",
    note: "地理上接近香格里拉段，但不在 G214 路边。香格里拉市 2026 年通告已将洗脸盆垭口至阿布吉措列为禁止开展旅游、探险的未开发区域，当前不纳入行程。",
    visitTime: "当前不安排", stay: "不进入，不安排住宿", stayTone: "avoid",
    effort: "未开放禁入区域", image: imageFor("abuji-lake.jpg"), coordinates: [99.9084, 27.6694], callout: [20, -70]
  },
  {
    name: "干河坝", type: "自然", grade: "B", status: "当前禁入", location: "云南省丽江市玉龙县，玉龙雪山南麓", route: "丽江南向远支线 · 位置参考",
    note: "它不在本次香格里拉向北的 G214 滇藏线上，而在丽江玉龙雪山南麓；属于自然保护区内的未开放区域，当前严禁擅自徒步进入。",
    visitTime: "当前不安排", stay: "不进入；游览玉龙雪山住丽江", stayTone: "avoid",
    effort: "未开放禁入区域", image: imageFor("ganheba.jpg"), coordinates: [100.22, 27.07], callout: [-105, -65]
  },
  {
    name: "南极洛", type: "自然", grade: "A", location: "云南省迪庆州维西县巴迪乡", route: "远线扩展 · 云南",
    note: "高山湖群、瀑布与原始森林很强，但不在川藏线，核心景观依赖高海拔长距离徒步。",
    visitTime: "至少 2 天", stay: "巴迪乡 / 南极洛村住 1 晚以上", stayTone: "yes",
    effort: "高强度徒步，本团不建议", image: imageFor("nanji-luo.jpg"), coordinates: [99.05, 27.67], callout: [24, 18]
  },
  {
    name: "冈仁波齐", type: "综合", grade: "A", location: "西藏阿里地区普兰县巴嘎乡", route: "远线扩展 · G219 阿里",
    note: "自然与信仰地位都很高，但从拉萨继续向西约 1300 公里，不属于 317/318 顺路景点。",
    visitTime: "拉萨往返至少 8 天", stay: "阿里需多晚，本次不安排", stayTone: "avoid",
    effort: "极远、极高海拔，本次不并入", image: imageFor("mount-kailash.jpg"), coordinates: [81.31, 31.07], callout: [24, -58]
  }
];

const CITIES = [
  { name: "成都", coordinates: [104.07, 30.67], dx: 12, dy: -10 },
  { name: "拉萨", coordinates: [91.13, 29.66], dx: -42, dy: -10 },
  { name: "昌都", coordinates: [97.18, 31.14], dx: -16, dy: -14 },
  { name: "林芝", coordinates: [94.36, 29.65], dx: 11, dy: 19 }
];

const ROUTE_PLANS = [
  {
    group: "进藏主线",
    index: "01",
    title: "G318 川藏南线",
    tone: "g318",
    mapMode: "g318",
    duration: "9–10 天",
    compressed: "压缩 7–8 天",
    stops: ["成都", "康定", "新都桥", "理塘", "芒康", "然乌", "波密", "林芝", "拉萨"],
    note: "自然景观密度最高，也最适合你们的 12 天窗口；抵达拉萨后仍能留出约 2 天。"
  },
  {
    group: "进藏主线",
    index: "02",
    title: "G317 川藏北线",
    tone: "g317",
    mapMode: "g317",
    duration: "10–12 天",
    compressed: "压缩 8–9 天",
    stops: ["成都", "汶川", "马尔康", "甘孜", "德格", "昌都", "那曲", "拉萨"],
    note: "寺院、藏寨和高原城镇更集中，路程更长；若走舒适节奏，抵达拉萨后余量很少。"
  },
  {
    group: "景点支线",
    index: "01",
    title: "格聂南线",
    tone: "genyen",
    mapMode: "genyen-route",
    duration: "2 天",
    compressed: "仅车览 1 天",
    stops: ["理塘", "铁匠山", "格聂镇", "格聂之眼", "格木", "巴塘"],
    note: "不是滇藏线，而是理塘至巴塘间替代普通 G318 的高海拔景观线；只建议交给熟悉线路、车型和当期路况的包车司机执行。"
  },
  {
    group: "景点支线",
    index: "02",
    title: "亚丁 · 香格里拉 · 南极洛线",
    tone: "yunnan",
    mapMode: "south-spurs",
    duration: "6–7 天",
    compressed: "不含南极洛 4–5 天",
    stops: ["理塘", "稻城", "亚丁", "乡城", "香格里拉", "维西", "南极洛"],
    note: "这不是顺路小绕行。若坚持少走路，建议在香格里拉收尾；南极洛需另留高强度徒步时间。"
  },
  {
    group: "景点支线",
    index: "03",
    title: "雨崩线",
    tone: "yubeng",
    mapMode: "yubeng-spur",
    duration: "至少 2–3 天",
    compressed: "不建议再压缩",
    stops: ["德钦", "飞来寺", "西当", "雨崩村", "神瀑 / 冰湖"],
    note: "是从 G214 德钦段转入的高海拔徒步支线，不是路边停车景点；可利用接驳降低进村强度，但核心景点仍需长距离步行。"
  },
  {
    group: "景点支线",
    index: "04",
    title: "纳木错线",
    tone: "lake",
    mapMode: "namtso-spur",
    duration: "2 天",
    compressed: "紧凑 1 天",
    stops: ["拉萨", "羊八井", "当雄", "纳木错", "拉萨"],
    note: "往返里程与海拔负担都较大，建议住一晚或至少避免与抵达拉萨的第一天相连。"
  },
  {
    group: "景点支线",
    index: "05",
    title: "羊卓雍措线",
    tone: "lake",
    mapMode: "yamdrok-spur",
    duration: "1 天",
    compressed: "半日可压缩",
    stops: ["拉萨", "曲水", "岗巴拉", "羊卓雍措", "拉萨"],
    note: "观景点集中、步行要求低，是六条线路中最容易插入拉萨停留日的一条。"
  }
];

const FINAL_ROADBOOK = [
  {
    date: "09.26", weekday: "周六", index: "D1", route: "成都 → 四姑娘山镇",
    distance: "约 220 km", drive: "5–7 小时", depart: "06:30", difficulty: "S2 · 铺装山路", tone: "moderate",
    stay: "四姑娘山镇，优先双桥沟口附近 · 约 3200 m",
    road: "成都至映秀以高速和快速路为主；映秀、卧龙至四姑娘山为 G350 二级双车道，整体铺装，连续弯道较多。",
    notes: "中秋假期车流是主要变量。巴朗山隧道前后不超车，观景只进正规停车区；首日不追求速度。",
    food: ["牦牛肉汤锅", "高原土豆", "酥油茶"],
    legs: [
      { from: "成都集合酒店（实际地址）", to: "双桥沟游客中心", via: "都汶高速 → 映秀 → 卧龙 → G350 → 巴朗山隧道" },
      { from: "双桥沟游客中心", to: "四姑娘山镇酒店（实际地址）", via: "按 G350 返回镇区；猫鼻梁只作为顺路可选停靠" }
    ],
    stops: [
      { name: "双桥沟轻量游", location: "四川省阿坝州小金县 · 四姑娘山镇", time: "3–4 小时", intro: "四姑娘山三条沟中接驳体系最成熟，雪山、森林、高山草甸和冰川遗迹集中，适合少走路的队伍。", note: "观光车为主，选择 2–3 个站点短步行" },
      { name: "猫鼻梁观景台", location: "四川省阿坝州小金县 · G350 四姑娘山镇段", time: "20–30 分钟", intro: "四姑娘山镇外的公路观景台，可远眺幺妹峰与群峰全景，是不进沟也能快速看雪山的机位。", note: "天气通透再停，不占用进沟时间" }
    ],
    cut: "14:30 后才抵达镇上时，取消双桥沟，改为猫鼻梁和镇区远观；不要把完整进沟挪到次日上午。"
  },
  {
    date: "09.27", weekday: "周日", index: "D2", route: "四姑娘山 → 丹巴 → 塔公 → 新都桥",
    distance: "约 270 km", drive: "7–8.5 小时", depart: "06:30", difficulty: "S2 · 铺装山路", tone: "moderate",
    stay: "新都桥镇中心或 G318 沿线 · 约 3400 m",
    road: "G350、G248 与塔公至新都桥连接线为铺装山路，穿村镇、弯道和牲畜横穿路段较多，节假日停车点容易拥堵。",
    notes: "当天总时长接近 11 小时。丹巴以后尽量由另一名司机接手；不要在弯道、草原路肩随意停车拍照。",
    food: ["牦牛肉火锅", "菌菇汤", "青稞饼"],
    legs: [
      { from: "四姑娘山镇酒店", to: "甲居藏寨游客中心", via: "小金 → 丹巴 → G350；不要接受无名村道近路" },
      { from: "甲居藏寨游客中心", to: "塔公寺停车区", via: "丹巴 → 八美 → G248；核对必须经过八美" },
      { from: "塔公寺停车区", to: "新都桥镇酒店（实际地址）", via: "塔公草原 → 新都桥镇；天黑前结束沿线拍摄" }
    ],
    stops: [
      { name: "甲居藏寨", location: "四川省甘孜州丹巴县 · 县城北侧大金河谷", time: "1–1.5 小时", intro: "嘉绒藏族村寨依山铺开，白色石墙、红色屋檐和碉楼与河谷形成层次，适合人文与建筑拍照。", note: "观景台与寨内轻量拍照，不深走" },
      { name: "塔公草原 / 塔公寺", location: "四川省甘孜州康定市 · 塔公镇", time: "1–1.5 小时", intro: "草原、雅拉雪山与塔公寺集中在同一区域，兼具开阔高原风景和藏传佛教人文。", note: "草原与寺院二选一重点拍摄" },
      { name: "新都桥沿线", location: "四川省甘孜州康定市 · 新都桥镇及 G318 沿线", time: "30–45 分钟", intro: "新都桥不是单一景区，而是一段由村落、杨林、牧场和低角度光线构成的摄影走廊。", note: "只保留日落前顺路机位" }
    ],
    cut: "13:30 后仍未离开丹巴，塔公改为路边远观；17:30 后不再寻找新都桥机位，直接入住。"
  },
  {
    date: "09.28", weekday: "周一", index: "D3", route: "新都桥 → 雅江 → 理塘",
    distance: "约 220 km", drive: "5–6 小时", depart: "07:30", difficulty: "S2/S3 · 高海拔铺装", tone: "moderate",
    stay: "理塘县城供氧酒店，连住两晚 · 约 4014 m",
    road: "全程以铺装 G318 为主，连续翻越高尔寺、剪子弯与卡子拉山一带；弯道、横风和高海拔是主要压力。",
    notes: "下午抵达后先办理入住，再确认次日小团司机、车牌、营运资质和天气。主车停酒店，只带日用小包参加格聂一日游。",
    food: ["理塘牦牛肉火锅", "松茸或菌菇菜", "藏面"],
    legs: [
      { from: "新都桥镇酒店", to: "天路十八弯观景台", via: "G318 → 雅江 → 剪子弯山方向" },
      { from: "天路十八弯观景台", to: "勒通古镇·千户藏寨", via: "G318 → 卡子拉山 → 理塘；全程保持在 G318" },
      { from: "勒通古镇·千户藏寨", to: "理塘县城酒店（实际地址）", via: "县城道路；入住后不再导航去郊外支路" }
    ],
    stops: [
      { name: "天路十八弯 / 卡子拉山", location: "四川省甘孜州 · 雅江县至理塘县 G318 高原段", time: "合计 30–45 分钟", intro: "G318 翻越山地形成连续弯道与高原观景带，可直观看到川藏公路所处的地形尺度。", note: "只在正规观景台停靠" },
      { name: "勒通古镇", location: "四川省甘孜州理塘县 · 高城镇城区", time: "1–1.5 小时", intro: "理塘代表性藏式街区，仁康古屋、白塔和传统院落集中，适合轻量人文游与街景拍摄。", note: "午餐后轻量拍照，不登高" },
      { name: "理塘东山顶 / 长青春科尔寺", location: "四川省甘孜州理塘县 · 县城东侧 / 城北寺院", time: "45–60 分钟", intro: "东山顶可俯瞰理塘县城；长青春科尔寺是理塘重要藏传佛教寺院，可按体力与光线二选一。", note: "体力允许二选一，不登高久留" }
    ],
    cut: "16:00 后才抵达理塘时，取消东山顶和寺院，只入住、吃饭并完成小团出行确认。"
  },
  {
    date: "09.29", weekday: "周二", index: "D4", route: "理塘 → 格聂之眼 → 理塘 · 当地小团",
    distance: "往返约 180–220 km", drive: "约 6–8 小时", depart: "以司机通知为准", difficulty: "小团 · 当地司机负责", tone: "group",
    stay: "理塘原酒店连住第二晚 · 约 4014 m",
    road: "理塘至格聂镇方向前段以铺装旅游公路为主，后段仍可能遇到窄路、碎石、积水与通信盲区；不进行格木至巴塘全穿越。",
    notes: "主车留在理塘酒店。预订 5–7 座合规营运车辆和熟路司机，合同写明酒店接送、铁匠山、花海、格聂之眼、返程时间及天气取消规则。",
    food: ["随车简餐", "高热量零食", "理塘牦牛肉晚餐"],
    legs: [
      { from: "理塘县城酒店", to: "铁匠山垭口", via: "由当地司机按格聂旅游公路行驶；不自行改线" },
      { from: "铁匠山垭口", to: "格聂之眼", via: "格聂花海 → 然日卡沿线；具体停车点服从当地司机" },
      { from: "格聂之眼", to: "理塘县城酒店", via: "原路返回理塘；不继续前往格木或巴塘" }
    ],
    stops: [
      { name: "铁匠山垭口", location: "四川省甘孜州理塘县 · 格聂景区东线", time: "20–30 分钟", intro: "裸岩尖峰与冰川地貌色彩强烈，是进入格聂东坡前辨识度很高的高海拔垭口。", note: "高海拔短停，风大立即上车" },
      { name: "格聂花海 / 然日卡沿线", location: "四川省甘孜州理塘县 · 格聂镇一带", time: "累计 30–45 分钟", intro: "高山草甸、河谷村落与格聂群峰可以同框，是格聂东坡最典型的开阔景观。", note: "由司机选择安全停车点" },
      { name: "格聂之眼", location: "四川省甘孜州理塘县 · 格聂镇然日卡村前方", time: "1–1.5 小时", intro: "草甸上的天然小湖池，晴天可倒映格聂群峰，是格聂线路最具识别度的人像机位之一。", note: "短步行和人像拍摄，不走草甸深处" }
    ],
    cut: "积雪、强降雨、施工或司机判断不适合进入时，按合同取消或改理塘周边；不临时换成无合同的私家车。"
  },
  {
    date: "09.30", weekday: "周三", index: "D5", route: "理塘 → 姊妹湖 → 巴塘 → 芒康",
    distance: "约 270 km", drive: "6–8 小时", depart: "07:00", difficulty: "S3 · G318 山区铺装", tone: "hard",
    stay: "芒康县城，选供氧、供暖和停车方便的酒店 · 约 3850 m",
    road: "全程以铺装 G318 为主，经海子山、巴塘和金沙江进入西藏；垭口横风、长下坡、落石和施工等待仍可能发生。",
    notes: "小团往返后主车重新上 G318。长下坡使用发动机制动或稳定能量回收，避免连续踩刹车；巴塘完成午餐、加油和车辆检查。",
    food: ["巴塘团结包子", "手工金丝面", "芒康藏面"],
    legs: [
      { from: "理塘县城酒店", to: "海子山姊妹湖观景台", via: "G318 向西 → 海子山；不要误转稻城方向" },
      { from: "海子山姊妹湖观景台", to: "巴塘县城中心", via: "继续沿 G318 下行" },
      { from: "巴塘县城中心", to: "芒康县城酒店（实际地址）", via: "G318 → 金沙江川藏界；不要选择盐井、G214 绕行" }
    ],
    stops: [
      { name: "海子山姊妹湖", location: "四川省甘孜州巴塘县 · 德达乡 G318 海子山段", time: "30–40 分钟", intro: "海子山上的两座冰川湖泊紧邻 G318 观景台，是川藏南线辨识度很高的湖景节点。", note: "恢复到最终路线，正规观景台短停" },
      { name: "巴塘县城", location: "四川省甘孜州巴塘县 · 夏邛镇城区", time: "1–1.5 小时", intro: "金沙江谷地的低海拔补给城，适合午餐、加油和短暂恢复，也能品尝本地面食。", note: "午餐、加油和车辆检查" },
      { name: "金沙江川藏界", location: "四川省巴塘县至西藏芒康县 · G318 金沙江大桥", time: "15–20 分钟", intro: "G318 跨越金沙江进入西藏的地理节点，主要价值是记录正式进藏的时刻。", note: "正规停车区短停" }
    ],
    cut: "不增加措普沟、盐井等支线；15:30 后仍未离开巴塘时改住巴塘，并接受后续压缩米堆冰川。"
  },
  {
    date: "10.01", weekday: "周四", index: "D6", route: "芒康 → 如美 → 东达山 → 左贡",
    distance: "约 160 km", drive: "5–6.5 小时", depart: "08:00", difficulty: "S2/S3 · 高海拔铺装", tone: "moderate",
    stay: "左贡县城，优先供暖、停车方便的酒店 · 约 3750 m",
    road: "全程沿铺装 G318，经如美、觉巴山和东达山进入左贡；距离不长，但连续爬升、落石、横风和高海拔会拉低平均速度。",
    notes: "这一天专门用来拆开原芒康至八宿长日。巴塘至芒康晚到也不必次日摸黑出发；如美或东达山后换司机，17:00 前入住左贡。",
    food: ["芒康藏面早餐", "如美简餐", "左贡牦牛肉汤锅"],
    legs: [
      { from: "芒康县城酒店", to: "如美镇", via: "G318 → 拉乌山 → 澜沧江峡谷；全程保持在 G318" },
      { from: "如美镇", to: "左贡县城酒店（实际地址）", via: "G318 → 觉巴山 → 东达山；不接受无名近路" }
    ],
    stops: [
      { name: "如美与澜沧江峡谷", location: "西藏自治区昌都市芒康县 · 如美镇 G318 沿线", time: "30–45 分钟", intro: "G318 从高原下切澜沧江河谷后的补给节点，峡谷高差明显，适合在正规停车区短休。", note: "午餐、换司机，不在峡谷路肩临停" },
      { name: "东达山垭口", location: "西藏自治区昌都市左贡县 · G318 东达山段", time: "15–20 分钟", intro: "G318 藏东高海拔垭口，天气变化很快，主要看点是公路海拔和周围群山尺度。", note: "只拍照，不在高海拔久留" },
      { name: "左贡县城", location: "西藏自治区昌都市左贡县 · 旺达镇", time: "下午休整", intro: "G318 藏东成熟落脚点，把原来的极限驾驶日拆成两段后，可在这里补给并恢复体力。", note: "入住后不再增加郊外景点" }
    ],
    cut: "出现施工等待或高反不适时取消沿途拍照，直接去左贡；本日没有必须追回的后续景点。"
  },
  {
    date: "10.02", weekday: "周五", index: "D7", route: "左贡 → 邦达 → 怒江 72 拐 → 八宿",
    distance: "约 200 km", drive: "5.5–7 小时", depart: "08:00", difficulty: "S3 · 长下坡铺装山路", tone: "hard",
    stay: "八宿县城，优先供暖、停车方便的酒店 · 约 3280 m",
    road: "全程沿 G318，经邦达草原、业拉山和怒江 72 拐进入八宿；主路铺装，但连续长下坡和峡谷路段仍需保守驾驶。",
    notes: "邦达补给并检查刹车、胎压，由状态更好的司机负责 72 拐下坡；低挡或稳定能量回收控速，不跨实线超车。",
    food: ["左贡早餐", "邦达简餐", "八宿家常川菜"],
    legs: [
      { from: "左贡县城酒店", to: "邦达镇", via: "全程 G318；邦达补给、验车并更换司机" },
      { from: "邦达镇", to: "怒江 72 拐观景台", via: "G318 → 业拉山 → 官方观景台" },
      { from: "怒江 72 拐观景台", to: "八宿县城酒店（实际地址）", via: "G318 下坡 → 怒江桥 → 八宿；峡谷内不临停" }
    ],
    stops: [
      { name: "邦达草原", location: "西藏自治区昌都市八宿县 · 邦达镇", time: "20–30 分钟", intro: "藏东开阔高原草甸，也是进入业拉山和怒江 72 拐前的重要交通节点。", note: "车辆检查、换司机和短休" },
      { name: "怒江 72 拐观景台", location: "西藏自治区昌都市八宿县 · G318 业拉山段", time: "25–35 分钟", intro: "G318 从业拉山盘旋下切怒江峡谷形成的连续发卡弯，是最具代表性的川藏公路景观之一。", note: "拍全景后立即下山" },
      { name: "八宿县城", location: "西藏自治区昌都市八宿县 · 白玛镇", time: "抵达即入住", intro: "藏东 G318 上成熟的补给和住宿节点，本日主要承担休息，不继续赶往然乌。", note: "检查刹车温度后停车休息" }
    ],
    cut: "14:30 后才离开邦达时取消 72 拐观景台停留，直接前往八宿；不通过夜驾赶然乌。"
  },
  {
    date: "10.03", weekday: "周六", index: "D8", route: "八宿 → 然乌 → 米堆冰川轻量版 → 波密",
    distance: "约 220 km", drive: "5–6 小时", depart: "07:30", difficulty: "S2 · 铺装主路 + 景区支线", tone: "moderate",
    stay: "波密县城 · 约 2700 m",
    road: "G318 主路整体铺装，冰川支线和停车区可能受施工、降雨及景区调度影响；国庆期间重点防排队。",
    notes: "以白天湖景替代然乌晨景。步行不适者使用景交和下方机位；米堆排队过长就取消，下午尽早到波密恢复。",
    food: ["途中简餐", "波密石锅鸡", "菌菇菜"],
    legs: [
      { from: "八宿县城酒店", to: "然乌湖主观景区", via: "G318 → 安久拉山 → 然乌镇" },
      { from: "然乌湖主观景区", to: "米堆冰川游客中心", via: "G318 → 玉普乡附近景区岔口 → 米堆景区支线" },
      { from: "米堆冰川游客中心", to: "波密县城酒店（实际地址）", via: "返回 G318 后向西前往波密" }
    ],
    stops: [
      { name: "然乌湖白天观景", location: "西藏自治区昌都市八宿县 · 然乌镇", time: "1–1.5 小时", intro: "雪山、冰川补给河流与狭长湖面组成高原湖群，公路沿线即可完成主要观景。", note: "湖边轻量游，不追逐多个机位" },
      { name: "米堆冰川轻量版", location: "西藏自治区林芝市波密县 · 玉普乡米堆村", time: "2.5–3 小时", intro: "森林、村落与雪峰层次明显的海洋性冰川景区，可用景交和短步行降低体力要求。", note: "景交加短步行，不走高强度路线" },
      { name: "波密河谷", location: "西藏自治区林芝市波密县 · 扎木镇及帕隆藏布河谷", time: "30 分钟", intro: "帕隆藏布河谷、森林和雪山在县城周边叠合，是 G318 后半段自然层次丰富的区域。", note: "入住前顺路拍摄" }
    ],
    cut: "冰川支线排队超过 45 分钟或天气封山时直接取消，保留然乌湖和波密河谷。"
  },
  {
    date: "10.04", weekday: "周日", index: "D9", route: "波密 → 通麦 → 鲁朗 → 林芝",
    distance: "约 230 km", drive: "5–6 小时", depart: "08:00", difficulty: "S2 · G318 铺装", tone: "moderate",
    stay: "林芝市巴宜区 · 约 3000 m",
    road: "通麦一带已以隧道桥梁和铺装道路为主，雨雾、湿滑、隧道明暗变化和货车仍是主要驾驶风险。",
    notes: "进隧道前提前开灯降速，不在隧道口停车；色季拉山风大且可能低温，短停即可。",
    food: ["鲁朗石锅鸡", "藏香猪", "松茸或时令菌菇"],
    legs: [
      { from: "波密县城酒店", to: "古乡湖观景点", via: "G318 向西，选择正规停车区" },
      { from: "古乡湖观景点", to: "鲁朗国际旅游小镇", via: "G318 → 通麦隧道群 → 鲁朗" },
      { from: "鲁朗国际旅游小镇", to: "色季拉山口观景台", via: "继续沿 G318 上山" },
      { from: "色季拉山口观景台", to: "林芝市巴宜区酒店（实际地址）", via: "G318 下山进入八一镇；不为日落延迟下山" }
    ],
    stops: [
      { name: "古乡湖 / 波密河谷", location: "西藏自治区林芝市波密县 · 古乡 G318 沿线", time: "30–40 分钟", intro: "安静湖面与森林雪山倒影为主，适合顺路短停，不必绕入支路深处。", note: "二选一顺路停靠" },
      { name: "鲁朗林海与小镇", location: "西藏自治区林芝市巴宜区 · 鲁朗镇", time: "1.5–2 小时", intro: "林海、牧场、藏式村落和雪山组合成熟，午餐、休息与旅拍可以一次完成。", note: "午餐与牧场拍照合并" },
      { name: "色季拉山口", location: "西藏自治区林芝市巴宜区 · 鲁朗至八一 G318 段", time: "20–30 分钟", intro: "G318 上的高山垭口，天气通透时可远眺南迦巴瓦峰，云雾大时不必等待。", note: "天气通透再等南迦巴瓦" }
    ],
    cut: "鲁朗午餐排队过长就缩短牧场停留；不为等待南迦巴瓦日落而夜间下山。"
  },
  {
    date: "10.05", weekday: "周一", index: "D10", route: "林芝 → 拉萨 · 午后半日人文",
    distance: "约 400 km", drive: "5–6 小时", depart: "07:00 天亮即走", difficulty: "S1 · 林拉高等级公路", tone: "easy",
    stay: "拉萨市城关区住一晚，优先北京路或八廓街外围 · 约 3650 m",
    road: "全程以林拉高等级公路为主，路面条件好；国庆返程车流、服务区拥堵和进拉萨后的市区交通是主要变量。",
    notes: "目标 12:30–13:30 抵达拉萨。取消巴松措，途中只做一次服务区休息；下午不安排有固定入场时段的布达拉宫内部参观。",
    food: ["林芝早餐", "拉萨甜茶", "牦牛肉藏面", "牦牛酸奶"],
    legs: [
      { from: "林芝市巴宜区酒店", to: "工布江达服务区", via: "林拉高等级公路；不转入巴松措 S504 支线" },
      { from: "工布江达服务区", to: "拉萨城关区酒店（实际地址）", via: "继续沿林拉高等级公路直达拉萨" },
      { from: "拉萨酒店", to: "大昭寺广场安检口", via: "午餐并入住后乘网约车或步行前往" },
      { from: "大昭寺 / 八廓街", to: "药王山观景台或布达拉宫广场", via: "仅在时间和体力允许时乘网约车前往" },
      { from: "布达拉宫外景区域", to: "拉萨酒店（实际地址）", via: "步行或网约车返回，不再增加夜间景点" }
    ],
    stops: [
      { name: "尼洋河 / 林拉服务区", location: "西藏自治区林芝市 · 巴宜区至工布江达县沿线", time: "20–30 分钟", intro: "尼洋河谷是林拉通道的核心自然背景，本日停靠只用于驾驶恢复和快速观景。", note: "只停一次，不转入巴松措" },
      { name: "拉萨入住与午餐", location: "西藏自治区拉萨市城关区 · 已预订酒店周边", time: "1–1.5 小时", intro: "先完成停车、入住和午餐，把公路行程与市内步行明确分开。", note: "行李放好后再乘网约车进老城" },
      { name: "大昭寺 / 八廓街", location: "西藏自治区拉萨市城关区 · 八廓街古城中心", time: "2–3 小时", intro: "重要藏传佛教寺院与传统转经街区共同构成拉萨人文核心，半天即可完成轻量体验。", note: "大昭寺内部按预约情况决定，八廓街以轻量拍照为主" },
      { name: "布达拉宫外景 / 药王山", location: "西藏自治区拉萨市城关区 · 北京中路一带", time: "30–45 分钟", intro: "不用进入宫内也能完成拉萨地标拍摄；药王山是经典正面机位。", note: "时间允许二选一，天黑前结束" }
    ],
    cut: "14:00 后才到拉萨时只保留大昭寺或八廓街；16:00 后抵达则只入住并拍布达拉宫外景，不购买非官方高价门票。"
  },
  {
    date: "10.06", weekday: "周二", index: "D11", route: "拉萨市区 → 拉萨贡嘎机场",
    distance: "约 65 km", drive: "1–1.5 小时", depart: "航班前 3.5 小时离店", difficulty: "S1 · 城市快速路", tone: "easy",
    stay: "当日飞成都，成都住宿",
    road: "机场高速和城市道路为主，国庆返程客流会增加值机、安检和还车时间。",
    notes: "异地还车至少另留 45–60 分钟；纸质合同、车辆照片、油量和违章查询页面全部留档。",
    food: ["甜茶", "藏面早餐", "机场简餐"],
    legs: [
      { from: "拉萨酒店（实际地址）", to: "租车公司拉萨还车点（实际地址）", via: "按租车公司确认路线；不要临时改到未确认门店" },
      { from: "租车公司拉萨还车点", to: "拉萨贡嘎机场出发层", via: "机场高速；还车后使用送机车或网约车，预留安检时间" }
    ],
    stops: [
      { name: "酒店早餐与退房", location: "西藏自治区拉萨市城关区 · 已预订酒店", time: "45–60 分钟", intro: "返程准备节点，用于核对证件、行李、租车合同和航班动态。", note: "不再安排市内景点" },
      { name: "异地还车 / 值机", location: "西藏自治区山南市贡嘎县 · 拉萨贡嘎机场区域", time: "至少 2.5 小时", intro: "先完成验车、油量或电量确认与书面交接，再进入机场值机和安检流程。", note: "以租车公司和航司要求为准" }
    ],
    cut: "返程日没有可压缩景点；出现交通异常时立即联系租车公司，优先保证航班。"
  }
];

const MODE_DETAILS = {
  all: {
    kicker: "路线总览",
    title: "G317 看藏地人文，G318 看峡谷、冰川、森林，并在拉萨收尾",
    meta: "成都 · 拉萨 · 22 个精选景点组（含徒步与禁入参考点）",
    routes: ["g317", "g318", "genyen-route", "west-loop", "shangri-la-spur", "g214-return", "yubeng-spur", "abuji-reference", "ganheba-reference", "nanji-spur", "namtso-spur", "yamdrok-spur"]
  },
  "grand-loop": {
    kicker: "川藏大环线",
    title: "G317 去、G318 回，线路最完整，但不适合本次 13 天全部走完",
    meta: "两条国道组合 · 适合拆段理解",
    routes: ["g317", "g318"]
  },
  "south-spurs": {
    kicker: "滇西南景点支线",
    title: "亚丁、香格里拉与 G214 构成可行主线；雨崩需徒步，阿布吉措和干河坝当前禁入",
    meta: "雨崩至少 2–3 天 · 两处禁入点仅作地理参考",
    routes: ["shangri-la-spur", "g214-return", "nanji-spur", "yubeng-spur", "abuji-reference", "ganheba-reference"]
  },
  "complete-options": {
    kicker: "完整行车路线",
    title: "G318 为主干，理塘后可选格聂南线，或转入亚丁、香格里拉与南极洛支线",
    meta: "格聂需确认路况 · 南极洛至少 2 天 · 雨崩至少 2–3 天",
    routes: ["g318", "genyen-route", "shangri-la-spur", "nanji-spur", "g214-return", "yubeng-spur", "namtso-spur", "yamdrok-spur"]
  },
  "final-locked": {
    kicker: "2026 最终路线",
    title: "川西小环线北段接 G318，理塘参加格聂之眼一日小团",
    meta: "9月26日成都出发 · 10月5日中午前后抵达拉萨 · 10月6日离开",
    routes: ["final-route", "final-genyen-daytrip"]
  }
};

const WEST_BOUNDS = L.latLngBounds([26.85, 89.4], [33.25, 105.4]);
const CHINA_BOUNDS = L.latLngBounds([18.0, 73.0], [54.2, 135.2]);
const stage = document.querySelector(".map-stage");
const tooltip = document.querySelector("#map-tooltip");
const selectionStrip = document.querySelector("#selection-strip");
const selectionKicker = document.querySelector("#selection-kicker");
const selectionTitle = document.querySelector("#selection-title");
const selectionMeta = document.querySelector("#selection-meta");
const pageTabs = [...document.querySelectorAll("[data-page-tab]")];
const pagePanels = [...document.querySelectorAll("[data-page-panel]")];
const routeTabs = [...document.querySelectorAll("[data-route-mode]")];
const spotsToggle = document.querySelector("#toggle-spots");
const focusWestButton = document.querySelector("#focus-west");
const resetViewButton = document.querySelector("#reset-view");
const spotList = document.querySelector("#spot-list");
const spotDialog = document.querySelector("#spot-dialog");
const spotDialogClose = document.querySelector("#spot-dialog-close");
const spotDialogImage = document.querySelector("#spot-dialog-image");
const spotDialogKicker = document.querySelector("#spot-dialog-kicker");
const spotDialogTitle = document.querySelector("#spot-dialog-title");
const spotDialogLocation = document.querySelector("#spot-dialog-location");
const spotDialogNote = document.querySelector("#spot-dialog-note");
const spotDialogRoute = document.querySelector("#spot-dialog-route");
const spotDialogEffort = document.querySelector("#spot-dialog-effort");
const spotDialogVisitTime = document.querySelector("#spot-dialog-visit-time");
const spotDialogStay = document.querySelector("#spot-dialog-stay");
const routePlanList = document.querySelector("#route-plan-list");
const completeRouteMapButton = document.querySelector("#complete-route-map");
const finalRoadbookList = document.querySelector("#final-roadbook-list");
const finalRouteMapButton = document.querySelector("#final-route-map");

let activeMode = "all";
let spotsVisible = true;
let selectedSpotName = null;
let overlayRoot;
let provinceLayer;
let provinceLabelLayer;
let routeLayer;
let spotLayer;
let cityLayer;
let interactionRestoreTimer;

const map = L.map("terrain-map", {
  zoomControl: false,
  attributionControl: true,
  minZoom: 3,
  maxZoom: 10,
  zoomSnap: 0.25,
  zoomDelta: 0.5,
  wheelPxPerZoomLevel: 90,
  keyboard: true
});

map.attributionControl.setPrefix(false);
L.tileLayer("https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
  maxZoom: 18,
  crossOrigin: true,
  attribution: "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
}).addTo(map);
L.control.zoom({ position: "bottomright" }).addTo(map);
L.svg({ padding: 0.8 }).addTo(map);
map.fitBounds(WEST_BOUNDS, { padding: [28, 28], animate: false });

function pointFor(coordinates) {
  return map.latLngToLayerPoint([coordinates[1], coordinates[0]]);
}

const leafletProjection = d3.geoTransform({
  point(longitude, latitude) {
    const point = map.latLngToLayerPoint([latitude, longitude]);
    this.stream.point(point.x, point.y);
  }
});
const geoPath = d3.geoPath(leafletProjection);
const smoothLine = d3.line()
  .x((point) => point.x)
  .y((point) => point.y)
  .curve(d3.curveCatmullRom.alpha(0.5));

function routePath(route) {
  return smoothLine(route.coordinates.map(pointFor));
}

function tooltipPosition(event) {
  const bounds = stage.getBoundingClientRect();
  const left = Math.min(event.clientX - bounds.left + 14, bounds.width - tooltip.offsetWidth - 12);
  const top = Math.max(12, Math.min(event.clientY - bounds.top - tooltip.offsetHeight - 12, bounds.height - tooltip.offsetHeight - 12));
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function showTooltip(event, html) {
  tooltip.innerHTML = html;
  tooltip.hidden = false;
  tooltipPosition(event);
}

function hideTooltip() {
  tooltip.hidden = true;
}

function detailForMode(mode) {
  if (MODE_DETAILS[mode]) return MODE_DETAILS[mode];
  const route = ROUTES.find((item) => item.id === mode);
  if (!route) return MODE_DETAILS.all;
  return { kicker: route.label, title: route.summary, meta: route.meta, routes: [route.id] };
}

function setSelectionMark(className) {
  selectionStrip.querySelector(".selection-mark").className = `selection-mark ${className}`;
}

function setActiveMode(mode) {
  activeMode = mode;
  const detail = detailForMode(mode);
  const activeRoutes = new Set(detail.routes);

  routeTabs.forEach((button) => {
    const isActive = button.dataset.routeMode === mode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (routeLayer) {
    const emphasizedRoutes = mode === "all" ? new Set() : activeRoutes;
    routeLayer.selectAll(".route-group")
      .classed("is-route-hidden", (route) => route.featuredOnly && !activeRoutes.has(route.id))
      .attr("aria-hidden", (route) => route.featuredOnly && !activeRoutes.has(route.id) ? "true" : null)
      .attr("tabindex", (route) => route.featuredOnly && !activeRoutes.has(route.id) ? -1 : 0)
      .classed("is-active", function () { return emphasizedRoutes.has(this.dataset.route); })
      .classed("is-muted", function () { return mode !== "all" && !activeRoutes.has(this.dataset.route); });
  }

  selectionKicker.textContent = detail.kicker;
  selectionTitle.textContent = detail.title;
  selectionMeta.textContent = detail.meta;
  setSelectionMark(mode === "all" || mode === "grand-loop" ? "mark-all" : `mark-${mode}`);
}

function showSpotDialog(spot) {
  spotDialogImage.src = spot.image;
  spotDialogImage.alt = `${spot.name}实景照片`;
  spotDialogKicker.textContent = `${spot.grade} 级 · ${spot.type}${spot.status ? ` · ${spot.status}` : ""}`;
  spotDialogTitle.textContent = spot.name;
  spotDialogLocation.textContent = spot.location;
  spotDialogNote.textContent = spot.note;
  spotDialogRoute.textContent = spot.route;
  spotDialogEffort.textContent = spot.effort;
  spotDialogVisitTime.textContent = spot.visitTime;
  spotDialogStay.textContent = spot.stay;
  if (!spotDialog.open) spotDialog.showModal();
}

function setSpotsVisible(visible) {
  spotsVisible = visible;
  spotsToggle.classList.toggle("is-active", spotsVisible);
  spotsToggle.setAttribute("aria-pressed", String(spotsVisible));
  if (spotLayer) spotLayer.classed("is-hidden", !spotsVisible);
}

function selectSpot(spot, node, { fly = false } = {}) {
  selectedSpotName = spot.name;
  setSpotsVisible(true);
  if (spotLayer) {
    spotLayer.selectAll(".spot-group").classed("is-selected", false);
    if (node) {
      d3.select(node).classed("is-selected", true);
    } else {
      spotLayer.selectAll(".spot-group")
        .filter((candidate) => candidate.name === spot.name)
        .classed("is-selected", true);
    }
  }
  selectionKicker.textContent = `${spot.grade} 级 · ${spot.type}`;
  selectionTitle.textContent = spot.name;
  selectionMeta.textContent = `${spot.location} · ${spot.route}`;
  setSelectionMark("mark-spot");
  if (fly) {
    const zoom = spot.name === "冈仁波齐" ? 6.25 : 7.25;
    map.flyTo([spot.coordinates[1], spot.coordinates[0]], zoom, { animate: true, duration: 0.7 });
  }
  updateMapLayers();
  showSpotDialog(spot);
}

function renderSpotCatalog() {
  const gradeOrder = { A: 0, B: 1, C: 2 };
  const gradeLabels = { A: "A级重点 · 优先安排", B: "B级可选 · 时间允许再加", C: "C级顺路 · 短暂停留" };
  const orderedSpots = [...SPOTS].sort((left, right) => gradeOrder[left.grade] - gradeOrder[right.grade]);
  const gradeCounts = orderedSpots.reduce((counts, spot) => {
    counts[spot.grade] = (counts[spot.grade] || 0) + 1;
    return counts;
  }, {});

  spotList.innerHTML = orderedSpots.map((spot, index) => `
    ${index === 0 || orderedSpots[index - 1].grade !== spot.grade ? `
      <li class="spot-grade-heading" data-grade="${spot.grade}">
        <span class="spot-grade-badge">${spot.grade}</span>
        <strong>${gradeLabels[spot.grade]}</strong>
        <span>${gradeCounts[spot.grade]} 个景点组</span>
      </li>
    ` : ""}
    <li class="spot-list-row" data-grade="${spot.grade}">
      <button class="spot-list-item" type="button" aria-label="查看${spot.name}照片并在地图定位">
        <span class="spot-list-index" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
        <img class="spot-list-image" src="${spot.image}" alt="" loading="lazy">
        <span class="spot-list-copy">
          <span class="spot-list-title-line">
            <strong>${spot.name}</strong>
            <span class="spot-type" data-type="${spot.type}">${spot.grade} · ${spot.type}</span>
            ${spot.status ? `<span class="spot-status">${spot.status}</span>` : ""}
          </span>
          <span class="spot-list-location">${spot.location}</span>
          <span class="spot-list-note">${spot.note}</span>
          <span class="spot-plan">
            <span class="spot-plan-item">
              <i data-lucide="clock-3" aria-hidden="true"></i>
              <span><small>建议游玩</small><strong>${spot.visitTime}</strong></span>
            </span>
            <span class="spot-plan-item" data-stay="${spot.stayTone}">
              <i data-lucide="bed-double" aria-hidden="true"></i>
              <span><small>住宿判断</small><strong>${spot.stay}</strong></span>
            </span>
          </span>
        </span>
        <span class="spot-list-side">
          <span class="spot-route">${spot.route}</span>
          <span class="spot-effort">${spot.effort}</span>
          <i data-lucide="camera" aria-hidden="true"></i>
        </span>
      </button>
    </li>
  `).join("");

  spotList.querySelectorAll(".spot-list-item").forEach((button, index) => {
    button.addEventListener("click", () => selectSpot(orderedSpots[index], null, { fly: true }));
  });
  createIcons({ icons: UI_ICONS });
}

function renderRoutePlans() {
  routePlanList.innerHTML = ROUTE_PLANS.map((plan, index) => `
    ${index === 0 || ROUTE_PLANS[index - 1].group !== plan.group ? `
      <div class="route-plan-group-heading">
        <span>${ROUTE_PLANS.filter((candidate) => candidate.group === plan.group).length} 条</span>
        <strong>${plan.group}</strong>
      </div>
    ` : ""}
    <article class="route-plan-row" data-tone="${plan.tone}">
      <div class="route-plan-identity">
        <span class="route-plan-line" aria-hidden="true"></span>
        <div>
          <span class="route-plan-index">${plan.group} ${plan.index}</span>
          <h3>${plan.title}</h3>
        </div>
      </div>
      <div class="route-plan-content">
        <div class="route-plan-stops" aria-label="路线：${plan.stops.join("至")}">
          ${plan.stops.map((stop, stopIndex) => `
            ${stopIndex > 0 ? '<span class="route-stop-separator" aria-hidden="true">→</span>' : ""}
            <span class="route-stop">${stop}</span>
          `).join("")}
        </div>
        <p>${plan.note}</p>
      </div>
      <div class="route-plan-duration">
        <span>舒适用时</span>
        <strong>${plan.duration}</strong>
        <small>${plan.compressed}</small>
      </div>
      <button class="route-plan-map" type="button" data-plan-map-mode="${plan.mapMode}" aria-label="在地图查看${plan.title}">
        <i data-lucide="map-pin" aria-hidden="true"></i>
        <span>地图</span>
      </button>
    </article>
  `).join("");

  routePlanList.querySelectorAll("[data-plan-map-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      setPageTab("map", { scroll: true });
      setActiveMode(button.dataset.planMapMode);
    });
  });
  createIcons({ icons: UI_ICONS });
}

function renderFinalRoadbook() {
  finalRoadbookList.innerHTML = FINAL_ROADBOOK.map((day) => `
    <article class="roadbook-day" data-tone="${day.tone}">
      <header class="roadbook-day-header">
        <div class="roadbook-date">
          <span>${day.date}</span>
          <small>${day.weekday}</small>
        </div>
        <div class="roadbook-route">
          <p>${day.index} · ${day.depart} 出发</p>
          <h3>${day.route}</h3>
        </div>
        <div class="roadbook-metrics">
          <span><i data-lucide="car" aria-hidden="true"></i>${day.distance}</span>
          <span><i data-lucide="clock-3" aria-hidden="true"></i>${day.drive}</span>
          <strong>${day.difficulty}</strong>
        </div>
      </header>
      <div class="roadbook-day-body">
        <ol class="roadbook-stops" aria-label="${day.date} 景点安排">
          ${day.stops.map((stop, index) => `
            <li class="roadbook-stop">
              <span class="roadbook-stop-index">${String(index + 1).padStart(2, "0")}</span>
              <div>
                <div class="roadbook-stop-title">
                  <strong>${stop.name}</strong>
                  <span>${stop.time}</span>
                </div>
                <p class="roadbook-stop-location"><i data-lucide="map-pin" aria-hidden="true"></i>${stop.location}</p>
                <p class="roadbook-stop-intro">${stop.intro}</p>
                <p class="roadbook-stop-note"><strong>游览提示</strong>${stop.note}</p>
              </div>
            </li>
          `).join("")}
        </ol>
        <dl class="roadbook-operations">
          <div>
            <dt><i data-lucide="hotel" aria-hidden="true"></i>留宿</dt>
            <dd>${day.stay}</dd>
          </div>
          <div>
            <dt><i data-lucide="shield-alert" aria-hidden="true"></i>道路</dt>
            <dd>${day.road}</dd>
          </div>
          <div>
            <dt><i data-lucide="car" aria-hidden="true"></i>驾驶</dt>
            <dd>${day.notes}</dd>
          </div>
          <div>
            <dt><i data-lucide="utensils" aria-hidden="true"></i>吃什么</dt>
            <dd>${day.food.join(" · ")}</dd>
          </div>
        </dl>
      </div>
      <section class="roadbook-navigation" aria-label="${day.date} 分段导航">
        <header>
          <strong><i data-lucide="route" aria-hidden="true"></i>分段导航</strong>
          <span>每到一站重新输入下一段</span>
        </header>
        <ol>
          ${day.legs.map((leg, index) => `
            <li>
              <span class="nav-leg-index">${String(index + 1).padStart(2, "0")}</span>
              <div class="nav-leg-endpoints">
                <div><small>起点</small><strong>${leg.from}</strong></div>
                <i data-lucide="arrow-right" aria-hidden="true"></i>
                <div><small>终点</small><strong>${leg.to}</strong></div>
              </div>
              <p><strong>核对途经</strong>${leg.via}</p>
            </li>
          `).join("")}
        </ol>
      </section>
      <footer class="roadbook-cut">
        <strong>当日删减线</strong>
        <span>${day.cut}</span>
      </footer>
    </article>
  `).join("");

  createIcons({ icons: UI_ICONS });
}

function setPageTab(name, { scroll = false } = {}) {
  pageTabs.forEach((button) => {
    const isActive = button.dataset.pageTab === name;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
    button.tabIndex = isActive ? 0 : -1;
  });
  pagePanels.forEach((panel) => {
    panel.hidden = panel.dataset.pagePanel !== name;
  });

  if (name === "map") {
    window.requestAnimationFrame(() => {
      map.invalidateSize({ pan: false });
      updateMapLayers();
    });
  }
  if (scroll) document.querySelector(".page-tabs").scrollIntoView({ behavior: "auto", block: "start" });
}

function calloutWidth(spot) {
  return Math.min(164, Math.max(92, spot.name.length * 13 + 22));
}

function calloutOffset(spot) {
  if (map.getSize().x >= 720 || selectedSpotName !== spot.name) return spot.callout;
  const point = pointFor(spot.coordinates);
  const width = calloutWidth(spot);
  const x = point.x < map.getSize().x / 2 ? 18 : -width - 18;
  const y = point.y < 76 ? 18 : -58;
  return [x, y];
}

function calloutPointer(spot) {
  const width = calloutWidth(spot);
  const [x, y] = calloutOffset(spot);
  const anchorX = x + width / 2;
  const anchorY = y < 0 ? y + 42 : y;
  return `M0,0 L${anchorX},${anchorY}`;
}

function updateMapLayers() {
  if (!overlayRoot) return;
  provinceLayer.selectAll("path").attr("d", geoPath);
  provinceLabelLayer.selectAll("text")
    .attr("transform", (feature) => {
      const point = pointFor(feature.properties.center);
      return `translate(${point.x},${point.y})`;
    });

  routeLayer.selectAll(".route-halo, .route-line, .route-hit").attr("d", routePath);
  routeLayer.selectAll(".route-label")
    .attr("transform", (route) => {
      const point = pointFor(route.labelAt);
      return `translate(${point.x},${point.y})`;
    });

  spotLayer.selectAll(".spot-group")
    .attr("transform", (spot) => {
      const point = pointFor(spot.coordinates);
      return `translate(${point.x},${point.y})`;
    });
  spotLayer.selectAll(".spot-callout")
    .attr("transform", (spot) => {
      const [x, y] = calloutOffset(spot);
      return `translate(${x},${y})`;
    });
  spotLayer.selectAll(".callout-pointer").attr("d", calloutPointer);

  cityLayer.selectAll(".city-group")
    .attr("transform", (city) => {
      const point = pointFor(city.coordinates);
      return `translate(${point.x},${point.y})`;
    });

  const desktopCallouts = map.getZoom() >= 5.25 && map.getSize().x >= 720;
  stage.classList.toggle("show-callouts", desktopCallouts);
  stage.classList.toggle("show-province-labels", map.getZoom() <= 5.2);
  stage.classList.toggle("show-route-labels", map.getZoom() >= 5.1);
}

function drawMap(china) {
  const mapFeatures = china.features.filter((feature) => feature.properties?.name);
  const overlaySvg = d3.select(map.getPanes().overlayPane).select("svg");
  overlaySvg.attr("aria-hidden", null).attr("role", "group").attr("aria-label", "路线与景点覆盖层");
  const leafletRoot = overlaySvg.select("g");
  overlayRoot = leafletRoot.append("g").attr("class", "travel-map-overlay");
  provinceLayer = overlayRoot.append("g").attr("class", "province-layer");
  provinceLabelLayer = overlayRoot.append("g").attr("class", "province-label-layer");
  routeLayer = overlayRoot.append("g").attr("class", "route-layer");
  spotLayer = overlayRoot.append("g").attr("class", "spot-layer");
  cityLayer = overlayRoot.append("g").attr("class", "city-layer");

  provinceLayer.selectAll("path")
    .data(mapFeatures)
    .join("path")
    .attr("class", (feature) => {
      const name = feature.properties.name;
      return `province${/四川|西藏|青海|云南/.test(name) ? " is-corridor" : ""}`;
    });

  const provinceLabels = ["四川省", "西藏自治区", "青海省", "云南省"];
  provinceLabelLayer.selectAll("text")
    .data(mapFeatures.filter((feature) => provinceLabels.includes(feature.properties.name)))
    .join("text")
    .attr("class", "province-label")
    .text((feature) => feature.properties.name.replace(/省|自治区/g, ""));

  const routeGroups = routeLayer.selectAll("g")
    .data(ROUTES)
    .join("g")
    .attr("class", "route-group")
    .attr("data-route", (route) => route.id)
    .attr("role", "button")
    .attr("aria-label", (route) => `选择${route.label}`)
    .attr("tabindex", 0);

  routeGroups.append("path").attr("class", "route-halo");
  routeGroups.append("path").attr("class", "route-line");
  routeGroups.append("path").attr("class", "route-hit leaflet-interactive");
  routeGroups.append("text")
    .attr("class", "route-label")
    .text((route) => route.shortLabel || (route.id === "west-loop" ? "川西小环线" : route.label.replace("川藏", "")));

  routeGroups
    .on("pointerenter", function (event, route) {
      d3.select(this).classed("is-hovered", true);
      showTooltip(event, `<strong>${route.label}</strong><br>${route.summary}`);
    })
    .on("pointermove", tooltipPosition)
    .on("pointerleave", function () {
      d3.select(this).classed("is-hovered", false);
      hideTooltip();
    })
    .on("click", (event, route) => {
      event.stopPropagation();
      setActiveMode(route.mode || route.id);
    })
    .on("keydown", (event, route) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setActiveMode(route.mode || route.id);
      }
    });

  const spotGroups = spotLayer.selectAll("g")
    .data(SPOTS)
    .join("g")
    .attr("class", "spot-group leaflet-interactive")
    .attr("data-type", (spot) => spot.type)
    .attr("data-status", (spot) => spot.status ? "restricted" : null)
    .attr("role", "button")
    .attr("aria-label", (spot) => `${spot.name}，${spot.grade}级${spot.type}景点，${spot.location}，${spot.route}`)
    .attr("tabindex", 0);

  spotGroups.append("path").attr("class", "callout-pointer").attr("d", calloutPointer);
  const callouts = spotGroups.append("g")
    .attr("class", "spot-callout")
    .attr("transform", (spot) => `translate(${spot.callout[0]},${spot.callout[1]})`);
  callouts.append("rect")
    .attr("width", calloutWidth)
    .attr("height", 42)
    .attr("rx", 4);
  callouts.append("text").attr("class", "callout-title").attr("x", 10).attr("y", 17).text((spot) => spot.name);
  callouts.append("text").attr("class", "callout-meta").attr("x", 10).attr("y", 33).text((spot) => `${spot.grade} 级 · ${spot.type}`);

  const markers = spotGroups.append("g").attr("class", "spot-marker");
  markers.append("circle").attr("class", "spot-circle leaflet-interactive").attr("r", 10);
  markers.append("text").attr("class", "spot-grade").attr("y", 0.5).text((spot) => spot.grade);

  spotGroups
    .on("pointerenter", (event, spot) => showTooltip(event, `<strong>${spot.name}</strong><br>${spot.grade} 级 · ${spot.type} · ${spot.route}<br>${spot.location}`))
    .on("pointermove", tooltipPosition)
    .on("pointerleave", hideTooltip)
    .on("click", function (event, spot) {
      event.stopPropagation();
      selectSpot(spot, this);
    })
    .on("keydown", function (event, spot) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectSpot(spot, this);
      }
    });

  const cityGroups = cityLayer.selectAll("g")
    .data(CITIES)
    .join("g")
    .attr("class", (city) => `city-group${city.name === "成都" || city.name === "拉萨" ? "" : " is-secondary"}`);
  cityGroups.append("circle").attr("class", "city-dot").attr("r", (city) => city.name === "成都" || city.name === "拉萨" ? 6 : 4);
  cityGroups.append("text")
    .attr("class", "city-label")
    .attr("x", (city) => city.dx)
    .attr("y", (city) => city.dy)
    .text((city) => city.name);

  function beginMapInteraction() {
    window.clearTimeout(interactionRestoreTimer);
    stage.classList.add("is-map-interacting");
    hideTooltip();
  }

  map.on("zoomstart", () => {
    stage.classList.add("spot-labels-collapsed");
    beginMapInteraction();
  });
  map.on("movestart", beginMapInteraction);
  map.on("zoomend moveend", () => {
    window.clearTimeout(interactionRestoreTimer);
    interactionRestoreTimer = window.setTimeout(() => {
      stage.classList.remove("is-map-interacting");
      updateMapLayers();
    }, 120);
  });
  map.on("viewreset resize", updateMapLayers);
  setActiveMode(activeMode);
  updateMapLayers();
}

function zoomToWest() {
  map.fitBounds(WEST_BOUNDS, { padding: [28, 28], animate: true, duration: 0.55 });
}

function resetView() {
  map.fitBounds(CHINA_BOUNDS, { padding: [20, 20], animate: true, duration: 0.55 });
}

pageTabs.forEach((button, index) => {
  button.addEventListener("click", () => setPageTab(button.dataset.pageTab));
  button.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextButton = pageTabs[(index + direction + pageTabs.length) % pageTabs.length];
    setPageTab(nextButton.dataset.pageTab);
    nextButton.focus();
  });
});

routeTabs.forEach((button) => button.addEventListener("click", () => setActiveMode(button.dataset.routeMode)));

completeRouteMapButton.addEventListener("click", () => {
  setPageTab("map", { scroll: true });
  setActiveMode("complete-options");
});

finalRouteMapButton.addEventListener("click", () => {
  setPageTab("map", { scroll: true });
  setActiveMode("final-locked");
});

spotsToggle.addEventListener("click", () => {
  setSpotsVisible(!spotsVisible);
});

focusWestButton.addEventListener("click", zoomToWest);
resetViewButton.addEventListener("click", resetView);
spotDialogClose.addEventListener("click", () => spotDialog.close());
spotDialog.addEventListener("click", (event) => {
  if (event.target === spotDialog) spotDialog.close();
});
window.addEventListener("resize", () => map.invalidateSize({ pan: false }));

renderSpotCatalog();
renderRoutePlans();
renderFinalRoadbook();

fetch(`${import.meta.env.BASE_URL}map/china-provinces-full.json`)
  .then((response) => {
    if (!response.ok) throw new Error(`地图数据加载失败：${response.status}`);
    return response.json();
  })
  .then(drawMap)
  .catch((error) => {
    selectionKicker.textContent = "地图加载失败";
    selectionTitle.textContent = error.message;
    selectionMeta.textContent = "请确认网络和 Node 开发服务可用";
  });
