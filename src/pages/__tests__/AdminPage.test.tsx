import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminPage } from '../AdminPage';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Mocks
vi.mock('../../context/AuthContext');
vi.mock('react-router-dom', () => ({
    ...vi.importActual('react-router-dom'),
    Link: ({ to, children, className }: any) => <a href={to} className={className}>{children}</a>,
    useNavigate: vi.fn(),
}));

describe('AdminPage', () => {
    const mockLogout = vi.fn();
    const mockNavigate = vi.fn();

    const defaultAuthContext = {
        user: { username: 'Admin', role: 'admin' },
        logout: mockLogout,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue(defaultAuthContext);
        (useNavigate as any).mockReturnValue(mockNavigate);
    });

    describe('前端元素', () => {
        it('渲染管理後台基本元素', () => {
            render(<AdminPage />);

            expect(screen.getByText('🛠️ 管理後台')).toBeInTheDocument();
            expect(screen.getByText('← 返回')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '登出' })).toBeInTheDocument();
            expect(screen.getByText('管理員專屬頁面')).toBeInTheDocument();
        });

        it('顯示使用者角色標籤', () => {
            render(<AdminPage />);

            const badge = screen.getByText('管理員');
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveClass('role-badge admin');
        });
    });

    describe('function 邏輯', () => {
        it('登出與導向', () => {
            render(<AdminPage />);

            fireEvent.click(screen.getByRole('button', { name: '登出' }));

            expect(mockLogout).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true, state: null });
        });
    });

    describe('交互', () => {
        it('返回儀表板', () => {
            // Note: Since we mocked Link as an anchor tag, we can punish it or just check attribute
            // However, typically we just check if the link is correct.
            // But if we want to test interaction with Link, testing-library has ways, or we just trust Link works.
            // Here we mocked Link to render <a>, so we check href.
            render(<AdminPage />);

            const backLink = screen.getByText('← 返回');
            expect(backLink).toHaveAttribute('href', '/dashboard');
        });
    });
});
