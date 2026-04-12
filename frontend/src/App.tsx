import React from 'react';
import './styles.css';

type Card = {
  id: string;
  name: string;
  bank: string;
  description?: string;
  limit: number;
  closingDay: number;
  dueDay: number;
};

type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string;
  transactionDate: string;
  card?: Card;
};

type Investment = {
  id: string;
  name: string;
  amount: number;
  monthlyRate: number;
  investedAt: string;
};

type Salary = {
  id: string;
  amount: number;
  description?: string;
  paymentDay?: number;
};

type Invoice = {
  cardId?: string;
  month: number;
  year: number;
  total: number;
  transactions: Transaction[];
};

type YieldResult = {
  months: number;
  principal: number;
  monthlyRate: number;
  income: number;
  total: number;
  investment: Investment;
};

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const today = new Date().toISOString().slice(0, 10);

const benefits = [
  {
    title: 'Saiba para onde o dinheiro vai',
    text: 'Acompanhe contas, vencimentos e custos recorrentes em uma visão tranquila.',
  },
  {
    title: 'Evite juros e atrasos',
    text: 'Tenha um panorama semanal para pagar em dia e manter o fluxo de caixa.',
  },
  {
    title: 'Planeje com confiança',
    text: 'Veja o que sobra após os gastos fixos e defina metas realistas.',
  },
];

const steps = [
  'Crie sua conta em segundos',
  'Adicione contas e renda mensal',
  'Veja uma linha do tempo limpa de pagamentos',
];

function CardsDashboard() {
  const [cards, setCards] = React.useState<Card[]>([]);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [investments, setInvestments] = React.useState<Investment[]>([]);
  const [salaries, setSalaries] = React.useState<Salary[]>([]);
  const [generalInvoice, setGeneralInvoice] = React.useState<Invoice | null>(null);
  const [cardInvoice, setCardInvoice] = React.useState<Invoice | null>(null);
  const [yieldResult, setYieldResult] = React.useState<YieldResult | null>(null);
  const [selectedCardId, setSelectedCardId] = React.useState('');
  const [selectedInvestmentId, setSelectedInvestmentId] = React.useState('');
  const [yieldMonths, setYieldMonths] = React.useState('6');
  const [csv, setCsv] = React.useState(
    'description,amount,type,category,transactionDate\nFarmacia,42.90,expense,Saude,2026-04-12\nPix recebido,100,income,Extra,2026-04-12',
  );
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const [cardForm, setCardForm] = React.useState({
    name: '',
    bank: '',
    description: '',
    limit: '2500',
    closingDay: '10',
    dueDay: '17',
  });

  const [transactionForm, setTransactionForm] = React.useState({
    description: '',
    amount: '',
    type: 'expense',
    category: '',
    transactionDate: today,
  });

  const [investmentForm, setInvestmentForm] = React.useState({
    name: '',
    amount: '',
    monthlyRate: '0.01',
    investedAt: today,
  });

  const [salaryForm, setSalaryForm] = React.useState({
    amount: '',
    description: 'Salario mensal',
    paymentDay: '5',
  });

  const request = React.useCallback(async <T,>(path: string, init?: RequestInit) => {
    const token = localStorage.getItem('financetracker_token');
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const detail = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
      throw new Error(detail || 'Nao foi possivel completar a acao.');
    }

    return data as T;
  }, []);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setMessage('');

    try {
      const [cardsData, transactionsData, investmentsData, salariesData, invoiceData] =
        await Promise.all([
          request<Card[]>('/cards'),
          request<Transaction[]>('/cards/transactions'),
          request<Investment[]>('/cards/investments'),
          request<Salary[]>('/cards/salary'),
          request<Invoice>('/cards/invoices/general'),
        ]);

      setCards(cardsData);
      setTransactions(transactionsData);
      setInvestments(investmentsData);
      setSalaries(salariesData);
      setGeneralInvoice(invoiceData);

      if (!selectedCardId && cardsData[0]?.id) {
        setSelectedCardId(cardsData[0].id);
      }

      if (!selectedInvestmentId && investmentsData[0]?.id) {
        setSelectedInvestmentId(investmentsData[0].id);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, [request, selectedCardId, selectedInvestmentId]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const createCard = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');

    try {
      const card = await request<Card>('/cards', {
        method: 'POST',
        body: JSON.stringify({
          ...cardForm,
          limit: Number(cardForm.limit),
          closingDay: Number(cardForm.closingDay),
          dueDay: Number(cardForm.dueDay),
        }),
      });

      setSelectedCardId(card.id);
      setCardForm({ name: '', bank: '', description: '', limit: '2500', closingDay: '10', dueDay: '17' });
      setMessage('Cartao cadastrado.');
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao criar cartao.');
    }
  };

  const createTransaction = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');

    try {
      await request<Transaction>('/cards/transactions', {
        method: 'POST',
        body: JSON.stringify({
          ...transactionForm,
          amount: Number(transactionForm.amount),
          cardId: selectedCardId || undefined,
        }),
      });

      setTransactionForm({
        description: '',
        amount: '',
        type: 'expense',
        category: '',
        transactionDate: today,
      });
      setMessage('Transacao cadastrada.');
      await refresh();
      await loadCardInvoice();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao criar transacao.');
    }
  };

  const importCsv = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');

    try {
      await request<Transaction[]>('/cards/transactions/import-csv', {
        method: 'POST',
        body: JSON.stringify({
          cardId: selectedCardId || undefined,
          csv,
        }),
      });

      setMessage('CSV importado.');
      await refresh();
      await loadCardInvoice();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao importar CSV.');
    }
  };

  const createInvestment = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');

    try {
      const investment = await request<Investment>('/cards/investments', {
        method: 'POST',
        body: JSON.stringify({
          ...investmentForm,
          amount: Number(investmentForm.amount),
          monthlyRate: Number(investmentForm.monthlyRate),
        }),
      });

      setSelectedInvestmentId(investment.id);
      setInvestmentForm({ name: '', amount: '', monthlyRate: '0.01', investedAt: today });
      setMessage('Investimento cadastrado.');
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao criar investimento.');
    }
  };

  const calculateYield = async () => {
    if (!selectedInvestmentId) {
      setMessage('Cadastre ou selecione um investimento.');
      return;
    }

    try {
      const data = await request<YieldResult>(
        `/cards/investments/${selectedInvestmentId}/yield/${Number(yieldMonths)}`,
      );
      setYieldResult(data);
      setMessage('Rendimento calculado.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao calcular rendimento.');
    }
  };

  const createSalary = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');

    try {
      await request<Salary>('/cards/salary', {
        method: 'POST',
        body: JSON.stringify({
          ...salaryForm,
          amount: Number(salaryForm.amount),
          paymentDay: Number(salaryForm.paymentDay),
        }),
      });

      setSalaryForm({ amount: '', description: 'Salario mensal', paymentDay: '5' });
      setMessage('Salario cadastrado.');
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao criar salario.');
    }
  };

  const loadCardInvoice = async () => {
    if (!selectedCardId) {
      return;
    }

    try {
      const data = await request<Invoice>(`/cards/${selectedCardId}/invoice`);
      setCardInvoice(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao carregar fatura.');
    }
  };

  const totalSalary = salaries.reduce((sum, salary) => sum + Number(salary.amount), 0);
  const totalInvested = investments.reduce(
    (sum, investment) => sum + Number(investment.amount),
    0,
  );
  const totalExpenses = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  return (
    <section id="cards" className="cards-dashboard">
      <header className="cards-header">
        <div>
          <p className="eyebrow">FinanceTracker</p>
          <h1>Cartoes, faturas e investimentos</h1>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={loading}>
          {loading ? 'Atualizando...' : 'Atualizar'}
        </button>
      </header>

      {message && <p className="notice">{message}</p>}

      <div className="cards-main">
        <section className="summary-grid" aria-label="Resumo financeiro">
          <article>
            <span>Fatura geral</span>
            <strong>{currency.format(generalInvoice?.total ?? 0)}</strong>
            <small>{generalInvoice ? `${generalInvoice.month}/${generalInvoice.year}` : 'Mes atual'}</small>
          </article>
          <article>
            <span>Salario</span>
            <strong>{currency.format(totalSalary)}</strong>
            <small>{salaries.length} registros</small>
          </article>
          <article>
            <span>Investido</span>
            <strong>{currency.format(totalInvested)}</strong>
            <small>{investments.length} investimentos</small>
          </article>
          <article>
            <span>Despesas</span>
            <strong>{currency.format(totalExpenses)}</strong>
            <small>{transactions.length} transacoes</small>
          </article>
        </section>

        <section className="workspace">
          <form className="panel" onSubmit={createCard}>
            <h2>Cadastrar cartao</h2>
            <label>
              Nome
              <input
                value={cardForm.name}
                onChange={(event) => setCardForm({ ...cardForm, name: event.target.value })}
                placeholder="Cartao principal"
                required
              />
            </label>
            <label>
              Banco
              <input
                value={cardForm.bank}
                onChange={(event) => setCardForm({ ...cardForm, bank: event.target.value })}
                placeholder="Nubank"
                required
              />
            </label>
            <label>
              Descricao
              <input
                value={cardForm.description}
                onChange={(event) => setCardForm({ ...cardForm, description: event.target.value })}
                placeholder="Uso diario"
              />
            </label>
            <div className="inline-fields">
              <label>
                Limite
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={cardForm.limit}
                  onChange={(event) => setCardForm({ ...cardForm, limit: event.target.value })}
                  required
                />
              </label>
              <label>
                Fecha
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={cardForm.closingDay}
                  onChange={(event) => setCardForm({ ...cardForm, closingDay: event.target.value })}
                  required
                />
              </label>
              <label>
                Vence
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={cardForm.dueDay}
                  onChange={(event) => setCardForm({ ...cardForm, dueDay: event.target.value })}
                  required
                />
              </label>
            </div>
            <button type="submit">Salvar cartao</button>
          </form>

          <form className="panel" onSubmit={createTransaction}>
            <h2>Nova transacao</h2>
            <label>
              Cartao
              <select
                value={selectedCardId}
                onChange={(event) => setSelectedCardId(event.target.value)}
              >
                <option value="">Sem cartao</option>
                {cards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name} - {card.bank}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Descricao
              <input
                value={transactionForm.description}
                onChange={(event) =>
                  setTransactionForm({ ...transactionForm, description: event.target.value })
                }
                placeholder="Mercado"
                required
              />
            </label>
            <div className="inline-fields">
              <label>
                Valor
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={transactionForm.amount}
                  onChange={(event) =>
                    setTransactionForm({ ...transactionForm, amount: event.target.value })
                  }
                  required
                />
              </label>
              <label>
                Tipo
                <select
                  value={transactionForm.type}
                  onChange={(event) =>
                    setTransactionForm({ ...transactionForm, type: event.target.value })
                  }
                >
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                </select>
              </label>
            </div>
            <label>
              Categoria
              <input
                value={transactionForm.category}
                onChange={(event) =>
                  setTransactionForm({ ...transactionForm, category: event.target.value })
                }
                placeholder="Alimentacao"
              />
            </label>
            <label>
              Data
              <input
                type="date"
                value={transactionForm.transactionDate}
                onChange={(event) =>
                  setTransactionForm({
                    ...transactionForm,
                    transactionDate: event.target.value,
                  })
                }
                required
              />
            </label>
            <button type="submit">Salvar transacao</button>
          </form>

          <form className="panel" onSubmit={createInvestment}>
            <h2>Investimento</h2>
            <label>
              Nome
              <input
                value={investmentForm.name}
                onChange={(event) =>
                  setInvestmentForm({ ...investmentForm, name: event.target.value })
                }
                placeholder="Tesouro Selic"
                required
              />
            </label>
            <div className="inline-fields">
              <label>
                Valor
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={investmentForm.amount}
                  onChange={(event) =>
                    setInvestmentForm({ ...investmentForm, amount: event.target.value })
                  }
                  required
                />
              </label>
              <label>
                Taxa mensal
                <input
                  type="number"
                  step="0.0001"
                  value={investmentForm.monthlyRate}
                  onChange={(event) =>
                    setInvestmentForm({ ...investmentForm, monthlyRate: event.target.value })
                  }
                  required
                />
              </label>
            </div>
            <label>
              Data
              <input
                type="date"
                value={investmentForm.investedAt}
                onChange={(event) =>
                  setInvestmentForm({ ...investmentForm, investedAt: event.target.value })
                }
                required
              />
            </label>
            <button type="submit">Salvar investimento</button>

            <div className="calc-box">
              <select
                value={selectedInvestmentId}
                onChange={(event) => setSelectedInvestmentId(event.target.value)}
              >
                <option value="">Selecione</option>
                {investments.map((investment) => (
                  <option key={investment.id} value={investment.id}>
                    {investment.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                value={yieldMonths}
                onChange={(event) => setYieldMonths(event.target.value)}
                aria-label="Meses"
              />
              <button type="button" onClick={() => void calculateYield()}>
                Calcular
              </button>
            </div>
            {yieldResult && (
              <p className="result">
                Rendimento: {currency.format(yieldResult.income)}. Total:{' '}
                {currency.format(yieldResult.total)}.
              </p>
            )}
          </form>

          <form className="panel" onSubmit={createSalary}>
            <h2>Salario</h2>
            <label>
              Valor
              <input
                type="number"
                min="0"
                step="0.01"
                value={salaryForm.amount}
                onChange={(event) => setSalaryForm({ ...salaryForm, amount: event.target.value })}
                required
              />
            </label>
            <label>
              Descricao
              <input
                value={salaryForm.description}
                onChange={(event) =>
                  setSalaryForm({ ...salaryForm, description: event.target.value })
                }
              />
            </label>
            <label>
              Dia de pagamento
              <input
                type="number"
                min="1"
                max="31"
                value={salaryForm.paymentDay}
                onChange={(event) =>
                  setSalaryForm({ ...salaryForm, paymentDay: event.target.value })
                }
              />
            </label>
            <button type="submit">Salvar salario</button>
          </form>
        </section>

        <section className="data-grid">
          <div className="panel wide">
            <div className="section-head">
              <h2>Faturas</h2>
              <button type="button" onClick={() => void loadCardInvoice()}>
                Ver fatura do cartao
              </button>
            </div>
            <div className="invoice-list">
              <article>
                <span>Geral</span>
                <strong>{currency.format(generalInvoice?.total ?? 0)}</strong>
                <small>{generalInvoice?.transactions.length ?? 0} despesas</small>
              </article>
              <article>
                <span>Cartao selecionado</span>
                <strong>{currency.format(cardInvoice?.total ?? 0)}</strong>
                <small>{cardInvoice?.transactions.length ?? 0} despesas</small>
              </article>
            </div>
          </div>

          <form className="panel wide" onSubmit={importCsv}>
            <h2>Importar CSV</h2>
            <p className="helper">Use colunas: description, amount, type, category, transactionDate.</p>
            <textarea value={csv} onChange={(event) => setCsv(event.target.value)} rows={5} />
            <button type="submit">Importar transacoes</button>
          </form>
        </section>

        <section className="lists">
          <div className="panel">
            <h2>Cartoes</h2>
            <div className="list">
              {cards.map((card) => (
                <button
                  className={selectedCardId === card.id ? 'list-item selected' : 'list-item'}
                  key={card.id}
                  type="button"
                  onClick={() => setSelectedCardId(card.id)}
                >
                  <strong>{card.name}</strong>
                  <span>
                    {card.bank} - limite {currency.format(Number(card.limit))}
                  </span>
                </button>
              ))}
              {!cards.length && <p className="empty">Nenhum cartao cadastrado.</p>}
            </div>
          </div>

          <div className="panel">
            <h2>Transacoes</h2>
            <div className="list">
              {transactions.slice(0, 8).map((transaction) => (
                <article className="list-item" key={transaction.id}>
                  <strong>{transaction.description}</strong>
                  <span>
                    {transaction.type === 'expense' ? '-' : '+'}
                    {currency.format(Number(transaction.amount))} - {transaction.transactionDate}
                  </span>
                </article>
              ))}
              {!transactions.length && <p className="empty">Nenhuma transacao cadastrada.</p>}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(
    () => Boolean(localStorage.getItem('financetracker_token')),
  );
  const [mode, setMode] = React.useState<'login' | 'register'>('login');
  const [formName, setFormName] = React.useState('');
  const [formEmail, setFormEmail] = React.useState('');
  const [formPassword, setFormPassword] = React.useState('');
  const [status, setStatus] = React.useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
  }>({
    type: 'idle',
    message: '',
  });

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
          password: formPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Nao foi possivel criar a conta.');
      }

      setStatus({ type: 'success', message: data?.message || 'Conta criada com sucesso.' });
      setMode('login');
      setFormPassword('');
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro inesperado ao criar conta.',
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
          password: formPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Nao foi possivel entrar.');
      }

      const token = data?.acess_token;
      if (token) {
        localStorage.setItem('financetracker_token', token);
      }

      setIsAuthenticated(true);
      setStatus({ type: 'success', message: 'Login realizado com sucesso.' });
      setFormPassword('');
      document.getElementById('cards')?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro inesperado ao fazer login.',
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('financetracker_token');
    setIsAuthenticated(false);
    setStatus({ type: 'idle', message: '' });
    document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth' });
  };

  const goToCards = () => {
    if (!isAuthenticated) {
      setMode('login');
      setStatus({
        type: 'error',
        message: 'Entre na sua conta para acessar a aba Cards.',
      });
      document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    document.getElementById('cards')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="logo">FinanceTracker</div>
        <nav className="nav">
          <a href="#home">Inicio</a>
          <a href="#benefits">Beneficios</a>
          <a href="#auth">Entrar</a>
          <button className="nav-link" type="button" onClick={goToCards}>
            Cards
          </button>
          {isAuthenticated && (
            <button className="nav-link" type="button" onClick={handleLogout}>
              Sair
            </button>
          )}
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
            <h1>Crie uma rotina financeira tranquila e confiavel.</h1>
            <p className="lead">
              O FinanceTracker ajuda voce a planejar contas, ver o total do mes e
              manter o fluxo de caixa claro, sem ruido. Suas financas, simples.
            </p>
            <div className="hero-actions">
              <a className="primary" href="#auth">Comecar agora</a>
              <button className="ghost" type="button" onClick={goToCards}>
                Ver cards
              </button>
            </div>
            <div className="trust">
              <span>Login seguro</span>
              <span>Visao simples</span>
              <span>Sem bagunca</span>
            </div>
          </div>

          <div className="hero-card">
            <div className="card-head">
              <span>Visao do mes</span>
              <span className="badge">Estavel</span>
            </div>
            <div className="amount">R$ 1.420,00</div>
            <p className="card-sub">Contas planejadas do mes</p>
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
                <p className="label">Proximo pagamento</p>
                <p className="value">Sexta-feira</p>
              </div>
              <div>
                <p className="label">Reserva automatica</p>
                <p className="value">R$ 120,00</p>
              </div>
            </div>
          </div>
        </section>

        <section id="benefits" className="benefits">
          <h2>Por que isso fica mais facil</h2>
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
            <h2>Mantenha todas as contas visiveis</h2>
            <p>
              Organize seus custos fixos, vencimentos do cartao e assinaturas em
              uma unica linha do tempo. Sem planilhas, sem estresse.
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
                <p>Cartao</p>
                <span>R$ 210,00</span>
              </div>
            </div>
          </div>
        </section>

        <section id="auth" className="auth">
          <div className="auth-copy">
            <h2>Comece sua rotina tranquila</h2>
            <p>
              Entre para continuar ou crie uma conta gratuita para comecar a
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
                <p className="hint">Depois do login voce segue para a area de cards.</p>
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
                <p className="hint">Ao continuar voce aceita nossos termos.</p>
              </form>
            )}
            {status.type !== 'idle' && (
              <p className={`status ${status.type}`}>{status.message}</p>
            )}
          </div>
        </section>

        {isAuthenticated ? (
          <CardsDashboard />
        ) : (
          <section id="cards" className="cards-locked">
            <div>
              <p className="eyebrow">Area protegida</p>
              <h2>Entre na sua conta para acessar Cards.</h2>
              <p>
                Depois do login, a aba Cards libera o cadastro de cartoes,
                transacoes, faturas, investimentos e salario.
              </p>
            </div>
            <button
              className="primary"
              type="button"
              onClick={() => {
                setMode('login');
                document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Entrar para acessar
            </button>
          </section>
        )}
      </main>

      <footer className="footer">
        <div>
          <strong>FinanceTracker</strong>
          <p>Controle calmo de contas para quem tem a vida corrida.</p>
        </div>
        <div className="footer-links">
          <a href="#home">Inicio</a>
          <a href="#benefits">Beneficios</a>
          <a href="#auth">Entrar</a>
          <button className="footer-link-button" type="button" onClick={goToCards}>
            Cards
          </button>
        </div>
      </footer>
    </div>
  );
}
