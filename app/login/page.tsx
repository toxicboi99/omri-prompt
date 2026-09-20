import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import { BrandLogo } from '@/components/common/brand';

export default function Login() {
  return <main className="auth-screen"><Link className="brand" href="/" aria-label="OMRI Prompt home"><BrandLogo className="auth-logo-image" /></Link><div className="auth-card"><div className="eyebrow blue">OMRI PROMPT ACCOUNT</div><h1>Welcome Back</h1><p>Sign in to manage the OMRI Prompt library.</p><LoginForm/></div></main>;
}
