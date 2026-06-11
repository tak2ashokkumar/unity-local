import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RandColorGeneratorService {
  readonly goldenRatio = 0.618033988749895;

  constructor() {
  }

  private hsvToRgb(h: number, s: number, v: number) {
    var hi = Math.floor(h * 6);
    var f = h * 6 - hi;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);
    var r = 255;
    var g = 255;
    var b = 255;

    switch (hi) {
      case 0:
        r = v;
        g = t;
        b = p;
        break;
      case 1:
        r = q;
        g = v;
        b = p;
        break;
      case 2:
        r = p;
        g = v;
        b = t;
        break;
      case 3:
        r = p;
        g = q;
        b = v;
        break;
      case 4:
        r = t;
        g = p;
        b = v;
        break;
      case 5:
        r = v;
        g = p;
        b = q;
        break;
    }
    return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
  };


  private padHex(str: string) {
    const hexWidth = 2;
    if (str.length > hexWidth) return str;
    return new Array(hexWidth - str.length + 1).join('0') + str;
  }

  private rgbToHex(rgb: number[]) {
    const parts = rgb.map(val => this.padHex(val.toString(16))).join('');
    return `#${parts}`;
  }

  private getHueValue(randomSeed: number) {
    randomSeed += this.goldenRatio;
    randomSeed %= 1;
    return randomSeed;
  }

  private getRgb(randomSeed: number, input?: { hue: number, saturation: number, value: number }) {
    if (input == null) {
      return this.hsvToRgb(randomSeed, 0.6, 0.95);
    } else {
      let { hue, saturation, value } = input;
      return this.hsvToRgb(hue, saturation, value);
    }
  }

  getDefaultRandomColor(rSeed: number) {
    const rgb = this.getRgb(rSeed ? rSeed : Math.random(), null);
    return this.rgbToHex(rgb);
  }

  getRandomColor(input: { hue: number, saturation: number, value: number }) {
    const rgb = this.getRgb(Math.random(), input);
    return this.rgbToHex(rgb);
  }

  getRandomColorSet(count: number) {
    let arr: string[] = [];
    let rSeed = this.getHueValue(Math.random());
    for (let i = 0; i < count; i++) {
      let color = this.getDefaultRandomColor(rSeed);
      while (arr.includes(color)) {
        rSeed = this.getHueValue(rSeed);
        color = this.getDefaultRandomColor(rSeed);
      }
      arr.push(color);
    }
    return arr;
  }

}
