import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginPage } from '../LoginPage';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Mocks
vi.mock('../../context/AuthContext');
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
}));

describe('LoginPage', () => {
    const mockLogin = vi.fn();
    const mockClearAuthExpiredMessage = vi.fn();
    const mockNavigate = vi.fn();

    // Default mock values
    const defaultAuthContext = {
        login: mockLogin,
        isAuthenticated: false,
        authExpiredMessage: null,
        clearAuthExpiredMessage: mockClearAuthExpiredMessage,
        user: null,
        token: null,
        isLoading: false,
        logout: vi.fn(),
        checkAuth: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue(defaultAuthContext);
        (useNavigate as any).mockReturnValue(mockNavigate);
    });

    describe('前端元素', () => {
        it('渲染登入頁面基本元素', () => {
            render(<LoginPage />);

            expect(screen.getByText('歡迎回來')).toBeInTheDocument();
            expect(screen.getByLabelText('電子郵件')).toBeInTheDocument();
            expect(screen.getByLabelText('密碼')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '登入' })).toBeInTheDocument();
        });
    });

    describe('表單驗證', () => {
        it('Email 格式驗證失敗', async () => {
            render(<LoginPage />);

            const emailInput = screen.getByLabelText('電子郵件');
            const submitButton = screen.getByRole('button', { name: '登入' });

            fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
            fireEvent.click(submitButton);

            expect(await screen.findByText('請輸入有效的 Email 格式')).toBeInTheDocument();
            expect(mockLogin).not.toHaveBeenCalled();
        });

        it('密碼長度不足', async () => {
            render(<LoginPage />);

            const passwordInput = screen.getByLabelText('密碼');
            const submitButton = screen.getByRole('button', { name: '登入' });

            fireEvent.change(passwordInput, { target: { value: '123' } });
            fireEvent.click(submitButton);

            expect(await screen.findByText('密碼必須至少 8 個字元')).toBeInTheDocument();
            expect(mockLogin).not.toHaveBeenCalled();
        });

        it('密碼缺少英文字母或數字', async () => {
            render(<LoginPage />);

            const passwordInput = screen.getByLabelText('密碼');
            const submitButton = screen.getByRole('button', { name: '登入' });

            fireEvent.change(passwordInput, { target: { value: '12345678' } });
            fireEvent.click(submitButton);

            expect(await screen.findByText('密碼必須包含英文字母和數字')).toBeInTheDocument();
            expect(mockLogin).not.toHaveBeenCalled();
        });
    });

    describe('Mock API', () => {
        it('登入失敗處理', async () => {
            mockLogin.mockRejectedValueOnce({
                response: {
                    data: {
                        message: '帳號或密碼錯誤'
                    }
                }
            });

            render(<LoginPage />);

            fireEvent.change(screen.getByLabelText('電子郵件'), { target: { value: 'test@example.com' } });
            fireEvent.change(screen.getByLabelText('密碼'), { target: { value: 'password123' } });

            const submitButton = screen.getByRole('button', { name: '登入' });
            fireEvent.click(submitButton);

            expect(await screen.findByText('帳號或密碼錯誤')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '登入' })).not.toBeDisabled();
        });

        it('登入成功跳轉', async () => {
            mockLogin.mockResolvedValueOnce(undefined);

            render(<LoginPage />);

            fireEvent.change(screen.getByLabelText('電子郵件'), { target: { value: 'test@example.com' } });
            fireEvent.change(screen.getByLabelText('密碼'), { target: { value: 'password123' } });

            const submitButton = screen.getByRole('button', { name: '登入' });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
                expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
            });
        });
    });

    describe('驗證權限', () => {
        it('已登入狀態導向', () => {
            (useAuth as any).mockReturnValue({
                ...defaultAuthContext,
                isAuthenticated: true,
            });

            render(<LoginPage />);

            expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
        });
    });

    describe('function 邏輯', () => {
        it('顯示授權過期訊息', () => {
            (useAuth as any).mockReturnValue({
                ...defaultAuthContext,
                authExpiredMessage: '登入已過期',
            });

            render(<LoginPage />);

            expect(screen.getByText('登入已過期')).toBeInTheDocument();
            expect(mockClearAuthExpiredMessage).toHaveBeenCalled();
        });
    });
});
