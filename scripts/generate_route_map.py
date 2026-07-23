#!/usr/bin/env python3
import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
GEOJSON = ROOT / "data/map/west-china-provinces-min.json"
OUT = ROOT / "assets/maps/sichuan-tibet-route-map.png"

WIDTH, HEIGHT = 2200, 1400
MAP_LEFT, MAP_TOP, MAP_RIGHT, MAP_BOTTOM = 90, 120, 1980, 1280
LON_MIN, LON_MAX = 88.2, 105.3
LAT_MIN, LAT_MAX = 27.2, 33.2


COLORS = {
    "bg": (248, 246, 238),
    "land": (231, 226, 207),
    "land2": (220, 228, 210),
    "border": (164, 151, 126),
    "text": (46, 44, 39),
    "muted": (105, 100, 88),
    "white": (255, 255, 255),
    "g318": (213, 86, 61),
    "g317": (65, 114, 183),
    "big": (155, 98, 176),
    "small": (57, 149, 121),
    "nature": (35, 126, 91),
    "human": (177, 90, 62),
    "mixed": (98, 78, 151),
    "exclude": (150, 146, 137),
}


def font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/STHeiti Light.ttc",
        "/System/Library/Fonts/Hiragino Sans GB.ttc",
        "/Library/Fonts/Arial Unicode.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size=size, index=0)
            except Exception:
                pass
    return ImageFont.load_default()


FONT_TITLE = font(46, True)
FONT_SUB = font(25)
FONT_LABEL = font(23)
FONT_SMALL = font(19)
FONT_TINY = font(16)


def xy(lon, lat):
    x = MAP_LEFT + (lon - LON_MIN) / (LON_MAX - LON_MIN) * (MAP_RIGHT - MAP_LEFT)
    y = MAP_BOTTOM - (lat - LAT_MIN) / (LAT_MAX - LAT_MIN) * (MAP_BOTTOM - MAP_TOP)
    return (x, y)


def rounded_line(draw, pts, fill, width, joint="curve"):
    if len(pts) < 2:
        return
    draw.line(pts, fill=fill, width=width, joint=joint)
    r = width / 2
    for x, y in pts:
        draw.ellipse((x - r, y - r, x + r, y + r), fill=fill)


def dashed_line(draw, pts, fill, width, dash=24, gap=16):
    for (x1, y1), (x2, y2) in zip(pts[:-1], pts[1:]):
        dx, dy = x2 - x1, y2 - y1
        dist = math.hypot(dx, dy)
        if dist == 0:
            continue
        ux, uy = dx / dist, dy / dist
        t = 0
        while t < dist:
            end = min(t + dash, dist)
            draw.line(
                [(x1 + ux * t, y1 + uy * t), (x1 + ux * end, y1 + uy * end)],
                fill=fill,
                width=width,
            )
            t += dash + gap


def draw_text_box(draw, xy_pos, text, fill, anchor="mm", pad=8):
    x, y = xy_pos
    bbox = draw.textbbox((x, y), text, font=FONT_SMALL, anchor=anchor)
    box = (bbox[0] - pad, bbox[1] - pad // 2, bbox[2] + pad, bbox[3] + pad // 2)
    draw.rounded_rectangle(box, radius=8, fill=(255, 255, 255, 218), outline=fill, width=2)
    draw.text((x, y), text, fill=COLORS["text"], font=FONT_SMALL, anchor=anchor)


def draw_point(draw, label, lon, lat, kind, grade, dx=12, dy=-12):
    x, y = xy(lon, lat)
    color = COLORS[kind]
    if kind == "nature":
        draw.ellipse((x - 9, y - 9, x + 9, y + 9), fill=COLORS["white"], outline=color, width=5)
    elif kind == "human":
        draw.regular_polygon((x, y, 13), n_sides=3, rotation=0, fill=COLORS["white"], outline=color)
        draw.regular_polygon((x, y, 11), n_sides=3, rotation=0, outline=color)
    else:
        draw.regular_polygon((x, y, 12), n_sides=4, rotation=45, fill=COLORS["white"], outline=color)
        draw.regular_polygon((x, y, 9), n_sides=4, rotation=45, outline=color)
    text = f"{label} {grade}"
    draw_text_box(draw, (x + dx, y + dy), text, color, anchor="lm")


def draw_geo(draw):
    data = json.loads(GEOJSON.read_text())
    province_fill = {
        "四川省": COLORS["land2"],
        "西藏自治区": (225, 221, 202),
        "云南省": (232, 224, 212),
        "青海省": (224, 229, 219),
        "甘肃省": (235, 229, 210),
        "重庆市": (229, 223, 207),
    }
    for feature in data["features"]:
        name = feature["properties"]["name"]
        geom = feature["geometry"]
        polys = []
        if geom["type"] == "Polygon":
            polys = geom["coordinates"]
        elif geom["type"] == "MultiPolygon":
            polys = [ring for poly in geom["coordinates"] for ring in poly]
        for ring in polys:
            pts = [xy(lon, lat) for lon, lat in ring]
            if len(pts) >= 3:
                draw.polygon(pts, fill=province_fill.get(name, COLORS["land"]), outline=COLORS["border"])


def route_points(raw):
    return [xy(lon, lat) for _, lon, lat in raw]


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    img = Image.new("RGB", (WIDTH, HEIGHT), COLORS["bg"])
    draw = ImageDraw.Draw(img, "RGBA")

    draw.rectangle((0, 0, WIDTH, HEIGHT), fill=COLORS["bg"])
    draw.rounded_rectangle((40, 40, WIDTH - 40, HEIGHT - 40), radius=28, fill=(255, 253, 246), outline=(219, 208, 184), width=3)
    draw_geo(draw)
    draw.rounded_rectangle((62, 54, 930, 168), radius=18, fill=(255, 255, 255, 226), outline=(219, 208, 184), width=2)
    draw.text((80, 66), "川藏路线与景点位置示意图", font=FONT_TITLE, fill=COLORS["text"])
    draw.text((82, 123), "重点看相对位置、路线尺度和景点聚合，不作为导航轨迹。", font=FONT_SUB, fill=COLORS["muted"])

    g318 = [
        ("成都", 104.067, 30.573), ("雅安", 103.013, 29.98), ("泸定", 102.234, 29.914),
        ("康定", 101.963, 30.05), ("新都桥", 101.485, 30.04), ("理塘", 100.27, 29.996),
        ("巴塘", 99.109, 30.005), ("芒康", 98.593, 29.68), ("左贡", 97.84, 29.67),
        ("八宿", 96.917, 30.053), ("然乌", 96.77, 29.45), ("波密", 95.77, 29.86),
        ("鲁朗", 94.74, 29.78), ("林芝", 94.36, 29.65), ("巴松措", 93.88, 30.0),
        ("拉萨", 91.132, 29.66),
    ]
    g317 = [
        ("成都", 104.067, 30.573), ("都江堰", 103.647, 30.988), ("汶川", 103.59, 31.476),
        ("马尔康", 102.206, 31.905), ("炉霍", 100.676, 31.391), ("甘孜", 99.993, 31.622),
        ("德格", 98.58, 31.806), ("江达", 98.218, 31.499), ("昌都", 97.18, 31.14),
        ("类乌齐", 96.6, 31.21), ("丁青", 95.598, 31.413), ("巴青", 94.054, 31.918),
        ("那曲", 92.05, 31.476), ("拉萨", 91.132, 29.66),
    ]
    small = [
        ("成都", 104.067, 30.573), ("映秀", 103.49, 31.06), ("四姑娘山", 102.9, 31.02),
        ("丹巴", 101.89, 30.87), ("塔公", 101.48, 30.32), ("新都桥", 101.485, 30.04),
        ("康定", 101.963, 30.05), ("成都", 104.067, 30.573),
    ]

    big_poly = route_points(g318 + list(reversed(g317)))
    draw.polygon(big_poly, fill=(*COLORS["big"], 28), outline=None)
    draw.line(big_poly + [big_poly[0]], fill=(*COLORS["big"], 150), width=4)

    small_poly = route_points(small)
    draw.polygon(small_poly, fill=(*COLORS["small"], 44), outline=None)
    draw.line(small_poly, fill=(*COLORS["small"], 180), width=4)

    rounded_line(draw, route_points(g318), COLORS["g318"], 10)
    dashed_line(draw, route_points(g317), COLORS["g317"], 9, dash=26, gap=16)

    for name, lon, lat in [("成都", 104.067, 30.573), ("康定", 101.963, 30.05), ("理塘", 100.27, 29.996), ("德格", 98.58, 31.806), ("昌都", 97.18, 31.14), ("林芝", 94.36, 29.65), ("拉萨", 91.132, 29.66)]:
        x, y = xy(lon, lat)
        draw.ellipse((x - 7, y - 7, x + 7, y + 7), fill=COLORS["text"])
        draw_text_box(draw, (x + 14, y - 16), name, COLORS["border"], anchor="lm", pad=7)

    draw_text_box(draw, xy(98.9, 29.2), "G318 南线", COLORS["g318"])
    draw_text_box(draw, xy(98.7, 31.55), "G317 北线", COLORS["g317"])
    draw_text_box(draw, xy(94.8, 31.2), "川藏大环线", COLORS["big"])
    draw_text_box(draw, xy(102.35, 30.55), "川西小环线", COLORS["small"])

    places = [
        ("拉萨组", 91.132, 29.66, "human", "A", 18, 30),
        ("羊卓雍措", 90.69, 28.93, "nature", "A", 14, -16),
        ("纳木错", 90.62, 30.72, "nature", "A", 14, -16),
        ("雅鲁藏布大峡谷", 94.85, 29.55, "nature", "A", 12, 26),
        ("鲁朗", 94.74, 29.78, "mixed", "A", 14, -24),
        ("巴松措", 93.88, 30.00, "mixed", "B", 14, -16),
        ("然乌湖", 96.77, 29.45, "nature", "A", 14, -22),
        ("米堆/来古冰川", 96.35, 29.45, "nature", "A", 10, 30),
        ("波密", 95.77, 29.86, "nature", "B", 14, -16),
        ("怒江72拐", 97.0, 30.02, "nature", "C", 14, -16),
        ("塔公/新都桥", 101.48, 30.22, "mixed", "A", 14, -22),
        ("甘孜/德格", 98.75, 31.72, "human", "A", 14, -22),
        ("四姑娘山/丹巴", 102.38, 30.95, "mixed", "B", 14, -22),
    ]
    for p in places:
        draw_point(draw, *p)

    legend_x, legend_y = 1540, 126
    draw.rounded_rectangle((legend_x, legend_y, WIDTH - 78, 545), radius=18, fill=(255, 255, 255, 232), outline=(218, 207, 184), width=2)
    draw.text((legend_x + 28, legend_y + 24), "图例与读图", font=FONT_LABEL, fill=COLORS["text"])
    legend_items = [
        ("G318 川藏南线", COLORS["g318"], "solid"),
        ("G317 川藏北线", COLORS["g317"], "dash"),
        ("川藏大环线范围", COLORS["big"], "area"),
        ("川西小环线范围", COLORS["small"], "area"),
        ("风景点", COLORS["nature"], "circle"),
        ("人文点", COLORS["human"], "triangle"),
        ("混合点", COLORS["mixed"], "diamond"),
    ]
    y = legend_y + 72
    for text, color, kind in legend_items:
        x = legend_x + 30
        if kind == "solid":
            draw.line((x, y + 12, x + 56, y + 12), fill=color, width=8)
        elif kind == "dash":
            dashed_line(draw, [(x, y + 12), (x + 56, y + 12)], color, 7, dash=14, gap=8)
        elif kind == "area":
            draw.rounded_rectangle((x, y + 3, x + 56, y + 22), radius=6, fill=(*color, 64), outline=color, width=2)
        elif kind == "circle":
            draw.ellipse((x + 18, y + 3, x + 40, y + 25), fill=COLORS["white"], outline=color, width=5)
        elif kind == "triangle":
            draw.regular_polygon((x + 29, y + 14, 14), n_sides=3, fill=COLORS["white"], outline=color)
        else:
            draw.regular_polygon((x + 29, y + 14, 13), n_sides=4, rotation=45, fill=COLORS["white"], outline=color)
        draw.text((x + 74, y), text, font=FONT_SMALL, fill=COLORS["text"])
        y += 46

    notes = [
        "主图不画珠峰/阿里：本次观光团不适合硬塞。",
        "大环线 = 318 南线进藏 + 317 北线回川，尺度很大。",
        "自然景观线重点看然乌、波密、鲁朗、林芝。",
    ]
    y += 12
    for note in notes:
        draw.text((legend_x + 30, y), "• " + note, font=FONT_TINY, fill=COLORS["muted"])
        y += 34

    draw.text((80, HEIGHT - 82), "底图：DataV GeoAtlas 省级边界；路线为旅行规划示意串点，非导航轨迹。", font=FONT_TINY, fill=COLORS["muted"])
    img.save(OUT, quality=94)
    print(OUT)


if __name__ == "__main__":
    main()
