#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets/maps/sichuan-tibet-cartoon-map.png"
W, H = 2400, 1500


def font(size):
    for p in [
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/STHeiti Light.ttc",
        "/System/Library/Fonts/Hiragino Sans GB.ttc",
    ]:
        if Path(p).exists():
            return ImageFont.truetype(p, size=size)
    return ImageFont.load_default()


F_TITLE = font(58)
F_SUB = font(30)
F_LABEL = font(27)
F_SMALL = font(22)
F_NOTE = font(20)


INK = (58, 48, 39)
MUTED = (118, 103, 84)
PAPER = (255, 248, 232)
TIBET = (235, 223, 196)
SICHUAN = (219, 235, 207)
BORDER = (210, 190, 153)
RED = (218, 92, 70)
BLUE = (68, 113, 190)
PURPLE = (181, 126, 210)
GREEN = (56, 166, 126)
LAKE = (112, 194, 205)
CULTURE = (198, 103, 78)
MIXED = (125, 102, 188)
WHITE = (255, 255, 255)


def curve(points, steps=22):
    result = []
    for a, b in zip(points[:-1], points[1:]):
        x1, y1 = a
        x2, y2 = b
        for i in range(steps):
            t = i / steps
            wobble = 8 * __import__("math").sin(t * 3.14159)
            result.append((x1 + (x2 - x1) * t, y1 + (y2 - y1) * t + wobble))
    result.append(points[-1])
    return result


def line(draw, pts, color, width, dash=False):
    pts = curve(pts, 10)
    if dash:
        for i in range(0, len(pts) - 1, 3):
            draw.line([pts[i], pts[i + 1]], fill=color, width=width)
    else:
        draw.line(pts, fill=color, width=width, joint="curve")
    r = width // 2
    for x, y in pts[::10]:
        draw.ellipse((x - r, y - r, x + r, y + r), fill=color)


def label(draw, x, y, text, color=BORDER, anchor="lm"):
    b = draw.textbbox((x, y), text, font=F_SMALL, anchor=anchor)
    draw.rounded_rectangle((b[0] - 10, b[1] - 5, b[2] + 10, b[3] + 5), 9, fill=(255, 255, 255), outline=color, width=2)
    draw.text((x, y), text, fill=INK, font=F_SMALL, anchor=anchor)


def spot(draw, x, y, text, kind="nature"):
    if kind == "nature":
        color = GREEN
        draw.ellipse((x - 13, y - 13, x + 13, y + 13), fill=WHITE, outline=color, width=6)
    elif kind == "human":
        color = CULTURE
        draw.polygon([(x, y - 16), (x - 15, y + 13), (x + 15, y + 13)], fill=WHITE, outline=color)
        draw.line([(x, y - 16), (x - 15, y + 13), (x + 15, y + 13), (x, y - 16)], fill=color, width=4)
    else:
        color = MIXED
        draw.polygon([(x, y - 16), (x + 16, y), (x, y + 16), (x - 16, y)], fill=WHITE, outline=color)
        draw.line([(x, y - 16), (x + 16, y), (x, y + 16), (x - 16, y), (x, y - 16)], fill=color, width=4)
    label(draw, x + 20, y - 4, text, color)


def mountain(draw, x, y, s=1):
    pts = [(x, y), (x + 42 * s, y - 80 * s), (x + 84 * s, y)]
    draw.polygon(pts, fill=(216, 202, 170), outline=(184, 164, 129))
    draw.polygon([(x + 42 * s, y - 80 * s), (x + 25 * s, y - 35 * s), (x + 56 * s, y - 42 * s)], fill=(255, 255, 248))


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    img = Image.new("RGB", (W, H), PAPER)
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle((45, 45, W - 45, H - 45), 34, fill=(255, 251, 240), outline=BORDER, width=4)

    # Cartoon land masses
    tibet = [(95, 245), (260, 140), (520, 160), (700, 235), (910, 210), (1100, 300), (1180, 470), (1110, 720), (920, 880), (650, 970), (380, 930), (185, 820), (85, 630)]
    sichuan = [(1270, 205), (1510, 135), (1770, 210), (2010, 370), (2165, 615), (2070, 890), (1810, 1010), (1540, 925), (1390, 760), (1220, 675), (1135, 490)]
    draw.polygon(tibet, fill=TIBET, outline=BORDER)
    draw.polygon(sichuan, fill=SICHUAN, outline=BORDER)
    draw.text((350, 330), "西藏", fill=(90, 82, 68), font=F_LABEL)
    draw.text((1640, 305), "四川 / 川西", fill=(77, 98, 65), font=F_LABEL)

    for mx, my, ms in [(180, 330, 1.0), (340, 475, 0.8), (690, 350, 0.9), (1250, 420, 0.8), (1500, 650, 0.9), (1840, 500, 0.75)]:
        mountain(draw, mx, my, ms)

    draw.line(curve([(470, 845), (650, 735), (830, 680), (1000, 705), (1215, 615), (1510, 575), (1785, 585)], 16), fill=LAKE, width=7)
    draw.line(curve([(820, 430), (720, 520), (590, 620), (460, 670)], 16), fill=LAKE, width=6)

    g318 = [(1785, 585), (1648, 658), (1490, 650), (1350, 640), (1195, 638), (1062, 636), (960, 720), (830, 710), (725, 780), (600, 792), (490, 735), (365, 755), (220, 815)]
    g317 = [(1785, 585), (1640, 500), (1510, 430), (1350, 360), (1160, 305), (970, 370), (790, 285), (640, 225), (500, 275), (405, 455), (320, 645), (220, 815)]
    small = [(1785, 585), (1650, 500), (1510, 575), (1445, 705), (1548, 800), (1690, 735), (1785, 585)]
    big = g318 + list(reversed(g317))

    draw.polygon(big, fill=(181, 126, 210), outline=None)
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.polygon(big, fill=(181, 126, 210, 42), outline=(148, 86, 176, 170))
    od.polygon(small, fill=(56, 166, 126, 50), outline=(45, 137, 105, 190))
    img.paste(Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"))
    draw = ImageDraw.Draw(img)

    line(draw, g318, RED, 14)
    line(draw, g317, BLUE, 11, dash=True)
    draw.line(small, fill=GREEN, width=5)

    for x, y, name in [(1785, 585, "成都"), (220, 815, "拉萨"), (1548, 800, "康定"), (1350, 640, "理塘"), (970, 370, "昌都"), (1160, 305, "德格"), (600, 792, "林芝")]:
        draw.ellipse((x - 10, y - 10, x + 10, y + 10), fill=INK)
        label(draw, x + 18, y - 12, name)

    label(draw, 1030, 835, "G318 川藏南线", RED)
    label(draw, 1010, 420, "G317 川藏北线", BLUE)
    label(draw, 720, 505, "川藏大环线", PURPLE)
    label(draw, 1530, 545, "川西小环线", GREEN)

    spot(draw, 220, 815, "拉萨组 A", "human")
    spot(draw, 175, 948, "羊卓雍措 A", "nature")
    spot(draw, 170, 610, "纳木错 A", "nature")
    spot(draw, 520, 865, "雅鲁藏布大峡谷 A", "nature")
    spot(draw, 480, 735, "鲁朗 A", "mixed")
    spot(draw, 410, 690, "巴松措 B", "mixed")
    spot(draw, 890, 725, "然乌湖 A", "nature")
    spot(draw, 820, 812, "米堆/来古冰川 A", "nature")
    spot(draw, 700, 705, "波密 B", "nature")
    spot(draw, 960, 640, "怒江72拐 C", "nature")
    spot(draw, 1510, 610, "塔公/新都桥 A", "mixed")
    spot(draw, 1180, 292, "甘孜/德格 A", "human")
    spot(draw, 1455, 705, "四姑娘山/丹巴 B", "mixed")

    # Title and legend
    draw.rounded_rectangle((80, 75, 890, 200), 24, fill=WHITE, outline=BORDER, width=3)
    draw.text((110, 98), "川藏路线与景点位置示意图", fill=INK, font=F_TITLE)
    draw.text((114, 160), "卡通版：看路线尺度、环线关系和景点聚合", fill=MUTED, font=F_SUB)

    lx, ly = 1720, 95
    draw.rounded_rectangle((lx, ly, W - 90, 485), 24, fill=WHITE, outline=BORDER, width=3)
    draw.text((lx + 35, ly + 30), "图例", fill=INK, font=F_LABEL)
    y = ly + 90
    draw.line((lx + 38, y, lx + 110, y), fill=RED, width=12); draw.text((lx + 135, y - 17), "G318 川藏南线", fill=INK, font=F_SMALL)
    y += 52
    for x in range(lx + 38, lx + 110, 28):
        draw.line((x, y, x + 16, y), fill=BLUE, width=10)
    draw.text((lx + 135, y - 17), "G317 川藏北线", fill=INK, font=F_SMALL)
    y += 52
    draw.rounded_rectangle((lx + 38, y - 14, lx + 110, y + 14), 8, fill=(230, 210, 240), outline=PURPLE, width=3); draw.text((lx + 135, y - 17), "川藏大环线", fill=INK, font=F_SMALL)
    y += 52
    draw.rounded_rectangle((lx + 38, y - 14, lx + 110, y + 14), 8, fill=(215, 239, 229), outline=GREEN, width=3); draw.text((lx + 135, y - 17), "川西小环线", fill=INK, font=F_SMALL)
    y += 60
    spot(draw, lx + 55, y, "风景", "nature")
    spot(draw, lx + 230, y, "人文", "human")
    spot(draw, lx + 390, y, "混合", "mixed")

    draw.text((90, H - 92), "不画珠峰/阿里：本次定位是旅行观光团，不做高海拔长线拉练。路线为规划示意，非导航轨迹。", fill=MUTED, font=F_NOTE)
    img.save(OUT)
    print(OUT)


if __name__ == "__main__":
    main()
