import { jest } from '@jest/globals'
import { renderHook } from '@testing-library/react'
import { useSnackbar, SnackbarContext } from '../useSnackbar'
import type { ReactNode } from 'react'
import { createElement } from 'react'

describe('useSnackbar', () => {
  it('SnackbarProvider の外で使うとエラーを投げる', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useSnackbar())).toThrow(
      'useSnackbar must be used within SnackbarProvider',
    )
    consoleSpy.mockRestore()
  })

  it('SnackbarProvider の内側では show 関数を返す', () => {
    const mockShow = () => {}
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(SnackbarContext.Provider, { value: { show: mockShow } }, children)

    const { result } = renderHook(() => useSnackbar(), { wrapper })
    expect(typeof result.current.show).toBe('function')
  })
})
