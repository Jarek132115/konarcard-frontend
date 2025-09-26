import React from "react";

export default function ProfilesScroller() {
    // 10 light variations around #FFECD2
    const colors = [
        "#FFECD2", "#FFE6C7", "#FFE1BC", "#FFEDDA", "#FFF2E4",
        "#FFDCC2", "#FFE8CE", "#FFF4E6", "#FFE3C6", "#FFEFDB",
    ];

    const containerRef = React.useRef(null);
    const trackRef = React.useRef(null);
    const rafRef = React.useRef(null);

    const isPressingRef = React.useRef(false);
    const allowHoverPauseRef = React.useRef(false); // armed after first real mouse move
    const hoverPausedRef = React.useRef(false);

    const speedPxPerSec = 26; // a little faster so it feels alive

    // arm hover only after the user actually moves the mouse
    React.useEffect(() => {
        const arm = () => (allowHoverPauseRef.current = true);
        window.addEventListener("mousemove", arm, { once: true });
        return () => window.removeEventListener("mousemove", arm);
    }, []);

    // Auto-scroll + wrap
    React.useEffect(() => {
        const el = containerRef.current;
        const track = trackRef.current;
        if (!el || !track) return;

        const half = () => track.scrollWidth / 2;
        let prev = performance.now();

        const tick = (now) => {
            const dt = (now - prev) / 1000;
            prev = now;

            if (!isPressingRef.current && !hoverPausedRef.current) {
                el.scrollLeft += speedPxPerSec * dt;
            }
            if (el.scrollLeft >= half()) el.scrollLeft -= half();
            if (el.scrollLeft <= 0) el.scrollLeft += half();

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, []);

    // press/drag & hover pause
    React.useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        let startX = 0;
        let startScroll = 0;

        const onDown = (e) => {
            isPressingRef.current = true;
            el.classList.add("dragging");
            startX = (e.touches ? e.touches[0].pageX : e.pageX);
            startScroll = el.scrollLeft;
        };
        const onMove = (e) => {
            if (!isPressingRef.current) return;
            const x = (e.touches ? e.touches[0].pageX : e.pageX);
            el.scrollLeft = startScroll - (x - startX);
            e.preventDefault();
        };
        const onUp = () => {
            isPressingRef.current = false;
            el.classList.remove("dragging");
        };

        const onEnter = () => {
            if (allowHoverPauseRef.current) hoverPausedRef.current = true;
        };
        const onLeave = () => (hoverPausedRef.current = false);

        el.addEventListener("mousedown", onDown);
        window.addEventListener("mousemove", onMove, { passive: false });
        window.addEventListener("mouseup", onUp);
        el.addEventListener("touchstart", onDown, { passive: true });
        el.addEventListener("touchmove", onMove, { passive: false });
        el.addEventListener("touchend", onUp);
        el.addEventListener("touchcancel", onUp);
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);

        return () => {
            el.removeEventListener("mousedown", onDown);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
            el.removeEventListener("touchstart", onDown);
            el.removeEventListener("touchmove", onMove);
            el.removeEventListener("touchend", onUp);
            el.removeEventListener("touchcancel", onUp);
            el.removeEventListener("mouseenter", onEnter);
            el.removeEventListener("mouseleave", onLeave);
        };
    }, []);

    const renderItems = (prefix) =>
        colors.map((bg, i) => (
            <div className="phone-pill v4" style={{ "--pill": bg }} key={`${prefix}-${i}`}>
                <div className="phone-viewport v4" />
            </div>
        ));

    return (
        <section className="profiles-edge">
            <div className="profiles-scroller-outer">
                <div className="profiles-scroller" ref={containerRef} aria-label="Scrolling example profiles">
                    <div className="profiles-track" ref={trackRef}>
                        {renderItems("a")}
                        {renderItems("b")}
                    </div>
                </div>
            </div>
        </section>
    );
}
