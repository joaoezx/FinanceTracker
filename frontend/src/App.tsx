import React from 'react';
import './styles.css';

const benefits = [
  {
    title: 'Saiba para onde o dinheiro vai',
    text: 'Acompanhe contas, vencimentos e custos recorrentes em uma visão tranquila.'
  },
  {
    title: 'Evite juros e atrasos',
    text: 'Tenha um panorama semanal para pagar em dia e manter o fluxo de caixa.'
  },
  {
    title: 'Planeje com confiança',
    text: 'Veja o que sobra após os gastos fixos e defina metas realistas.'
  }
];

const steps = [
  'Crie sua conta em segundos',
  'Adicione contas e renda mensal',
  'Veja uma linha do tempo limpa de pagamentos'
];

export default function App() {
  const [mode, setMode] = React.useState<'login' | 'register'>('login');
  const [formName, setFormName] = React.useState('');
  const [formEmail, setFormEmail] = React.useState('');
  const [formPassword, setFormPassword] = React.useState('');
  const [status, setStatus] = React.useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: ''
  });

  const apiBaseUrl = (import.meta as ImportMeta).env.VITE_API_URL || 'http://localhost:3000';

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus({ type: 'idle', message: '' });

    try {
      const response = await fetch(`${apiBaseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          email: formEmail.trim(),
          password: formPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Não foi possível criar a conta.');
      }

      setStatus({ type: 'success', message: data?.message || 'Conta criada com sucesso.' });
      setMode('login');
      setFormPassword('');
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro inesperado ao criar conta.'
      });
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus({ type: 'idle', message: '' });

    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formEmail.trim(),
          password: formPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Não foi possível entrar.');
      }

      const token = data?.acess_token;
      if (token) {
        localStorage.setItem('financetracker_token', token);
      }

      setStatus({ type: 'success', message: 'Login realizado com sucesso.' });
      setFormPassword('');
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro inesperado ao fazer login.'
      });
    }
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="logo">FinanceTracker</div>
        <nav className="nav">
          <a href="#home">Início</a>
          <a href="#benefits">Benefícios</a>
          <a href="#auth">Entrar</a>
          <button
            className="pill"
            type="button"
            onClick={() => {
              setMode('register');
              document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Criar conta
          </button>
        </nav>
      </header>

      <main>
        <section id="home" className="hero">
          <div className="hero-text">
            <p className="eyebrow">Controle calmo das suas contas</p>
            <h1>Crie uma rotina financeira tranquila e confiável.</h1>
            <p className="lead">
              O FinanceTracker ajuda você a planejar contas, ver o total do mês e
              manter o fluxo de caixa claro, sem ruído. Suas finanças, simples.
            </p>
            <div className="hero-actions">
              <a className="primary" href="#auth">Começar agora</a>
              <button className="ghost" type="button">Ver demo</button>
            </div>
            <div className="trust">
              <span>Login seguro</span>
              <span>Visão simples</span>
              <span>Sem bagunça</span>
            </div>
          </div>

          <div className="hero-card">
            <div className="card-head">
              <span>Visão de março</span>
              <span className="badge">Estável</span>
            </div>
            <div className="amount">R$ 1.420,00</div>
            <p className="card-sub">Contas planejadas do mês</p>
            <div className="progress">
              <div className="progress-fill" />
            </div>
            <div className="grid">
              <div>
                <p className="label">Vence nesta semana</p>
                <p className="value">R$ 210,00</p>
              </div>
              <div>
                <p className="label">Restante</p>
                <p className="value">R$ 980,00</p>
              </div>
              <div>
                <p className="label">Próximo pagamento</p>
                <p className="value">Sexta-feira</p>
              </div>
              <div>
                <p className="label">Reserva automática</p>
                <p className="value">R$ 120,00</p>
              </div>
            </div>
          </div>
        </section>

        <section id="benefits" className="benefits">
          <h2>Por que isso fica mais fácil</h2>
          <div className="benefit-grid">
            {benefits.map((benefit) => (
              <article key={benefit.title}>
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </article>
            ))}
          </div>
          <div className="steps">
            {steps.map((step, index) => (
              <div key={step} className="step">
                <span>0{index + 1}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="split">
          <div className="panel">
            <h2>Mantenha todas as contas visíveis</h2>
            <p>
              Organize seus custos fixos, vencimentos do cartão e assinaturas em
              uma única linha do tempo. Sem planilhas, sem estresse.
            </p>
            <ul className="list">
              <li>Contas recorrentes e categorias</li>
              <li>Resumo mensal com totais</li>
              <li>Notas por conta para lembretes</li>
            </ul>
          </div>
          <div className="panel light">
            <h3>Foco semanal</h3>
            <p className="soft">Esta semana</p>
            <div className="mini">
              <div>
                <p>Internet</p>
                <span>R$ 49,90</span>
              </div>
              <div>
                <p>Aluguel</p>
                <span>R$ 780,00</span>
              </div>
              <div>
                <p>Cartão</p>
                <span>R$ 210,00</span>
              </div>
            </div>
          </div>
        </section>

        <section id="auth" className="auth">
          <div className="auth-copy">
            <h2>Comece sua rotina tranquila</h2>
            <p>
              Entre para continuar ou crie uma conta gratuita para começar a
              controlar suas contas hoje.
            </p>
          </div>
          <div className="auth-card">
            <div className="auth-tabs">
              <button
                type="button"
                className={mode === 'login' ? 'active' : ''}
                onClick={() => setMode('login')}
              >
                Entrar
              </button>
              <button
                type="button"
                className={mode === 'register' ? 'active' : ''}
                onClick={() => setMode('register')}
              >
                Criar conta
              </button>
            </div>

            {mode === 'login' ? (
              <form className="form" onSubmit={handleLogin}>
                <label>
                  Email
                  <input
                    type="email"
                    placeholder="voce@email.com"
                    value={formEmail}
                    onChange={(event) => setFormEmail(event.target.value)}
                    required
                  />
                </label>
                <label>
                  Senha
                  <input
                    type="password"
                    placeholder="Sua senha"
                    value={formPassword}
                    onChange={(event) => setFormPassword(event.target.value)}
                    required
                  />
                </label>
                <button className="primary" type="submit">Entrar</button>
                <p className="hint">Esqueceu a senha? Recupere depois.</p>
              </form>
            ) : (
              <form className="form" onSubmit={handleRegister}>
                <label>
                  Nome
                  <input
                    type="text"
                    placeholder="Ana Silva"
                    value={formName}
                    onChange={(event) => setFormName(event.target.value)}
                    required
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    placeholder="ana@email.com"
                    value={formEmail}
                    onChange={(event) => setFormEmail(event.target.value)}
                    required
                  />
                </label>
                <label>
                  Senha
                  <input
                    type="password"
                    placeholder="Crie uma senha"
                    value={formPassword}
                    onChange={(event) => setFormPassword(event.target.value)}
                    required
                  />
                </label>
                <button className="primary" type="submit">Criar conta</button>
                <p className="hint">Ao continuar você aceita nossos termos.</p>
              </form>
            )}
            {status.type !== 'idle' && (
              <p className={`status ${status.type}`}>{status.message}</p>
            )}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div>
          <strong>FinanceTracker</strong>
          <p>Controle calmo de contas para quem tem a vida corrida.</p>
        </div>
        <div className="footer-links">
          <a href="#home">Início</a>
          <a href="#benefits">Benefícios</a>
          <a href="#auth">Entrar</a>
        </div>
      </footer>
    </div>
  );
}
