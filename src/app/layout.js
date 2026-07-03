import "./globals.css";

export const metadata = {
  title: "Spotify TrueTune",
  description: "AI taste protection and music discovery concept demo.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body>
        <div className="phone-wrapper">
          <div className="phone-container">
            {/* iPhone Notch */}
            <div className="phone-notch">
              <div className="phone-camera" />
              <div className="phone-speaker" />
            </div>
            
            {/* Scrollable Viewport Container */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", paddingTop: "24px" }}>
              {children}
            </div>

            {/* Persistent Student Concept Disclaimer */}
            <footer className="disclaimer-text">
              This is a non-commercial student concept demo of a hypothetical Spotify feature (TrueTune) and is not affiliated with, endorsed by, or produced by Spotify.
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
