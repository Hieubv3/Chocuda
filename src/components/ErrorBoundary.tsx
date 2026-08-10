import { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Trash2, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React Component Tree:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetStorage = () => {
    try {
      localStorage.removeItem('hb_properties');
      localStorage.removeItem('hb_projects');
      localStorage.removeItem('hb_news');
      localStorage.removeItem('hb_saved_properties');
      alert('Đã xóa bộ nhớ đệm cache tạm thời! Trang web sẽ tự động tải lại.');
      window.location.href = window.location.origin + window.location.search;
    } catch (e) {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center mx-auto ring-4 ring-rose-500/10">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-black text-white uppercase tracking-tight">
                ĐÃ XẢY RA LỖI GIAO DIỆN
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hệ thống gặp sự cố khi hiển thị dữ liệu hoặc do bộ nhớ trình duyệt bị đầy. Vui lòng thử tải lại trang hoặc khôi phục dữ liệu đệm.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-rose-400 text-left overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 animate-spin-slow" />
                TẢI LẠI TRANG NGAY
              </button>

              <button
                onClick={this.handleResetStorage}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-amber-500" />
                XÓA CACHE BỘ NHỚ ĐỆM TẠM THỜI
              </button>

              <a
                href="/"
                className="block w-full py-2.5 text-xs text-slate-400 hover:text-white text-center font-semibold"
              >
                Trở về Trang Chủ
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
