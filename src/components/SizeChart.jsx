import { useState } from "react";

export default function SizeChartOverlay() {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Trigger */}
            <span className="variant-title">
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    style={{
                        background: "none",
                        border: 0,
                        cursor: "pointer",
                        textDecoration: "none",
                        color: "inherit",
                    }}
                >
                    <i className="fas fa-ruler-combined" /> Size chart
                </button>
            </span>

            {/* Overlay */}
            {open && (
                <div
                    onClick={() => setOpen(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.7)",
                        zIndex: 1055,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "12px 16px",
                        }}
                    >
                        <h5 style={{ margin: 0, color: "#fff", background: "#000000ff", padding: "12px 16px", }}>Size Chart</h5>
                        <button
                            onClick={() => setOpen(false)}
                            style={{
                                border: 0,
                                color: "#fff",
                                fontSize: 20,         
                                cursor: "pointer",
                                background: "rgba(0,0,0,0.8)", 
                                width: "50px",          
                                height: "50px",
                                borderRadius: "50%", 
                                display: "flex",       
                                alignItems: "center",
                                justifyContent: "center",
                                lineHeight: 1,        
                            }}
                            aria-label="Close"
                        >
                            ×
                        </button>
                    </div>

                    {/* Body */}
                    <div
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0,
                        }}
                    >
                        <img
                            src="https://res.cloudinary.com/dekf5dyng/image/upload/f_webp/v1749721391/chart_vnri1x.png"
                            alt="Size Chart"
                            style={{
                                width: "auto",
                                height: "auto",
                                maxWidth: "100vw",
                                maxHeight: "100vh",
                                objectFit: "contain",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
