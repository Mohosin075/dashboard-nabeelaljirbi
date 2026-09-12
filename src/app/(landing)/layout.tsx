



const CommonLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {/* <Navbar /> */}
      <main className="min-h-screen bg-gray-50">{children}</main>
    </>
  );
};

export default CommonLayout;
