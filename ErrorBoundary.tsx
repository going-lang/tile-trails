import React from 'react';

interface State {
  hasError: boolean;
  message: string;
}

/**
 * Catches any unexpected render/runtime error in the React tree and shows a friendly
 * recovery screen instead of a blank white WebView. Progress is safe in localStorage.
 */
export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(err: unknown): State {
    return { hasError: true, message: err instanceof Error ? err.message : String(err) };
  }

  componentDidCatch(error: unknown) {
    // Keep a breadcrumb for debugging without crashing the app
    try {
      console.error('[TileTrails] Recovered from error:', error);
    } catch {
      /* noop */
    }
  }

  private reload = () => {
    try {
      window.location.reload();
    } catch {
      this.setState({ hasError: false, message: '' });
    }
  };

  private softReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="w-screen h-dvh bg-slate-950 flex items-center justify-center p-6 text-center select-none">
        <div className="w-full max-w-sm rounded-3xl bg-[#FFFDF9] border-4 border-[#DEC8A8] p-6 shadow-2xl space-y-4">
          <div className="text-5xl">🍂</div>
          <h1 className="font-display text-2xl font-bold text-[#3D2B1F]">Oops, a tile slipped!</h1>
          <p className="text-xs text-[#6B513A] font-medium">
            Something unexpected happened, but your progress is safe. Tap below to get back on the trail.
          </p>
          <div className="space-y-2">
            <button onClick={this.softReset} className="w-full btn-tactile-green py-3 rounded-2xl font-display text-lg font-bold text-white">
              ▶ Continue
            </button>
            <button onClick={this.reload} className="w-full btn-tactile-cream py-2.5 rounded-2xl font-bold text-xs text-[#5C4433]">
              🔄 Restart Game
            </button>
          </div>
          {this.state.message && (
            <p className="text-[9px] text-[#8C6D4F] font-mono break-all opacity-70">{this.state.message.slice(0, 140)}</p>
          )}
        </div>
      </div>
    );
  }
}
