import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardPage } from '../DashboardPage';
import { useAuth } from '../../context/AuthContext';
import { productApi } from '../../api/productApi';
import { useNavigate } from 'react-router-dom';

// Mocks
vi.mock('../../context/AuthContext');
vi.mock('../../api/productApi');
vi.mock('react-router-dom', () => ({
    Link: ({ to, children, className }: any) => <a href={to} className={className}>{children}</a>,
    useNavigate: vi.fn(),
}));

describe('DashboardPage', () => {
    const mockLogout = vi.fn();
    const mockNavigate = vi.fn();

    const defaultUser = { username: 'TestUser', role: 'user' };
    const defaultAuthContext = {
        user: defaultUser,
        logout: mockLogout,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue(defaultAuthContext);
        (useNavigate as any).mockReturnValue(mockNavigate);
        // Default product mock (loading effectively handled by checking initial render or resolving promises)
    });

    describe('前端元素', () => {
        it('渲染儀表板基本元素', async () => {
            (productApi.getProducts as any).mockResolvedValue([]);
            render(<DashboardPage />);

            expect(screen.getByText('儀表板')).toBeInTheDocument();
            // Wait for user effect to settle or user basic text
            expect(screen.getByText(/Welcome, TestUser/)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '登出' })).toBeInTheDocument();

            // Wait for loading to finish to avoid act warning
            await waitFor(() => {
                expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument();
            });
        });

        it('Admin 角色顯示管理後台連結', async () => {
            (useAuth as any).mockReturnValue({
                user: { username: 'Admin', role: 'admin' },
                logout: mockLogout,
            });
            (productApi.getProducts as any).mockResolvedValue([]);

            render(<DashboardPage />);

            expect(screen.getByText('🛠️ 管理後台')).toBeInTheDocument();
            expect(screen.getByText('🛠️ 管理後台')).toHaveAttribute('href', '/admin');

            await waitFor(() => {
                expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument();
            });
        });

        it('一般用戶不顯示管理後台連結', async () => {
            (productApi.getProducts as any).mockResolvedValue([]);
            render(<DashboardPage />);

            expect(screen.queryByText('🛠️ 管理後台')).not.toBeInTheDocument();

            await waitFor(() => {
                expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument();
            });
        });
    });

    describe('Mock API', () => {
        it('商品載入中狀態', () => {
            // Return a promise that never resolves to simulate loading
            (productApi.getProducts as any).mockReturnValue(new Promise(() => { }));
            render(<DashboardPage />);

            expect(screen.getByText('載入商品中...')).toBeInTheDocument();
        });

        it('商品載入成功並渲染列表', async () => {
            const mockProducts = [
                { id: 1, name: 'Product A', price: 100, description: 'Desc A' },
                { id: 2, name: 'Product B', price: 200, description: 'Desc B' },
            ];
            (productApi.getProducts as any).mockResolvedValue(mockProducts);

            render(<DashboardPage />);

            await waitFor(() => {
                expect(screen.getByText('Product A')).toBeInTheDocument();
                expect(screen.getByText('NT$ 100')).toBeInTheDocument();
                expect(screen.getByText('Product B')).toBeInTheDocument();
                expect(screen.getByText('NT$ 200')).toBeInTheDocument();
            });
            expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument();
        });

        it('商品載入失敗', async () => {
            (productApi.getProducts as any).mockRejectedValue({
                response: { status: 500, data: { message: '無法載入商品資料' } }
            });

            render(<DashboardPage />);

            await waitFor(() => {
                expect(screen.getByText('無法載入商品資料')).toBeInTheDocument();
            });
            expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument();
        });
    });

    describe('function 邏輯', () => {
        it('登出功能', async () => {
            (productApi.getProducts as any).mockResolvedValue([]);
            render(<DashboardPage />);

            fireEvent.click(screen.getByRole('button', { name: '登出' }));

            expect(mockLogout).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true, state: null });

            await waitFor(() => {
                expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument();
            });
        });
    });
});
