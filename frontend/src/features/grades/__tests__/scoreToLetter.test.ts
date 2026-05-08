import { scoreToLetter } from '../types'

describe('scoreToLetter', () => {
  it('90 以上は S を返す', () => {
    expect(scoreToLetter(90)).toBe('S')
    expect(scoreToLetter(100)).toBe('S')
    expect(scoreToLetter(95)).toBe('S')
  })

  it('80〜89 は A を返す', () => {
    expect(scoreToLetter(80)).toBe('A')
    expect(scoreToLetter(89)).toBe('A')
    expect(scoreToLetter(85)).toBe('A')
  })

  it('70〜79 は B を返す', () => {
    expect(scoreToLetter(70)).toBe('B')
    expect(scoreToLetter(79)).toBe('B')
  })

  it('60〜69 は C を返す', () => {
    expect(scoreToLetter(60)).toBe('C')
    expect(scoreToLetter(69)).toBe('C')
  })

  it('50〜59 は D を返す', () => {
    expect(scoreToLetter(50)).toBe('D')
    expect(scoreToLetter(59)).toBe('D')
  })

  it('50 未満は F を返す', () => {
    expect(scoreToLetter(49)).toBe('F')
    expect(scoreToLetter(0)).toBe('F')
  })

  it('境界値を正しく処理する', () => {
    expect(scoreToLetter(89)).toBe('A')
    expect(scoreToLetter(90)).toBe('S')
    expect(scoreToLetter(79)).toBe('B')
    expect(scoreToLetter(80)).toBe('A')
    expect(scoreToLetter(69)).toBe('C')
    expect(scoreToLetter(70)).toBe('B')
  })
})
