import Sidebar from "./Sidebar";
import Header from "./Header";

function DashboardLayout({ children, role = "officer" }) {

    return (
        <div className="min-h-screen bg-gray-50 flex">

            {/* Sidebar */}
            <Sidebar role={role} />

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Header */}
                <Header role={role} />

                {/* Page Content */}
                <main className="flex-1 p-6">
                    {children}
                </main>

            </div>

        </div>
    );
}

export default DashboardLayout;