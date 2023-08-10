import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "../globals.css";

export const metadata = {
	title: "Threads KW",
	description: "Threads KW Ihksan Ghazi",
	icons: {
		icon: "/logo.svg",
	},
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ClerkProvider>
			<html lang="en">
				<body className={`${inter.className} bg-dark-1`}>
					<div className="w-full justify-center items-center min-h-screen">
						{children}
					</div>
				</body>
			</html>
		</ClerkProvider>
	);
}
