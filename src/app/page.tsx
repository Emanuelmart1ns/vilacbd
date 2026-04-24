import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={`container fade-in ${styles.hero}`}>
        <h1>Vila CBD</h1>
        <p>A experiência premium de bem-estar botânico em Santa Maria da Feira.</p>
        <button className="btn-primary">Explorar Coleção</button>
      </div>
    </main>
  );
}
