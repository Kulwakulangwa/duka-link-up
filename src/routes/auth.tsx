// ... imports same as before

function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    setLoading(true);

    // Capture referral code from URL or sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    let refCode = urlParams.get('ref');
    if (!refCode) refCode = sessionStorage.getItem('referral_code');

    const { data: signUp, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { referral_code: refCode || null }
      },
    });

    if (error || !signUp.user) {
      setLoading(false);
      return toast.error(error?.message ?? "Sign up failed");
    }

    sessionStorage.removeItem('referral_code');
    toast.success("Account created! Now set up your shop.");
    navigate({ to: "/create-shop" });
  }

  // ... rest of the form JSX unchanged
}
