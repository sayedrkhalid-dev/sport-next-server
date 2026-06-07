const protect = async (req, res, next) => {
  try {
    const response = await fetch(
      `${process.env.FRONTEND_URL}/api/auth/get-session`,
      {
        headers: { cookie: req.headers.cookie || "" },
      }
    );

    const session = await response.json();

    if (!session?.user?.email) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    req.user = session.user; // { id, name, email, image }
    next();
  } catch {
    res.status(401).json({ message: "Authentication failed" });
  }
};

module.exports = protect;