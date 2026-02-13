import React from "react";
import styles from './Home.module.css';
//import Card from "../ui/cards/card";
import Button from "../ui/button/Button";
import { useAuth } from '../../context/authContext';
import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Software } from "../../types/softwares";
import { i } from "framer-motion/client";
import { FaRegStar, FaStar } from "react-icons/fa";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area
} from 'recharts';
import UserAvatarSvg from "../ui/userAvatar/UserAvatarSvg";
import QuizzSetup from "../quizz/QuizzSetup";



interface Home {
    usersCount: number;
    totalSessions: number;
}
interface MainContentProps {
  sidebarVisible: boolean;
}
const Home: React.FC<MainContentProps> = ({ sidebarVisible }) => {
    const [softwares, setSoftwares] = useState<Software[]>([]);
    const { token, setToken } = useAuth();
    const [ homeData , setHomeData] = useState<Home | null>(null);
    const [expanded, setExpanded] = useState(false);
    const displayedSoftwares = expanded ? softwares.slice(0, 10) : [];
    const navigate = useNavigate();
    const [isFavorite, setIsFavorite] = useState(false);
    const [buttonHover, setButtonHover] = useState(false);
    const mockChartData = [
      { date: '01/01', score: 0 },
      { date: '03/01', score: 21 },
      { date: '05/01', score: 35 },
      { date: '07/01', score: 40 },
      { date: '09/01', score: 56 },
      { date: '11/01', score: 60 },
      { date: '13/01', score: 75 },
      { date: '15/01', score: 81 },
      { date: '17/01', score: 87 },
      { date: '19/01', score: 92 },
    ];
    useEffect(() => {
    const fetchSoftwares = async () => {
      try {
        const res = await axios.get<Software[]>("http://localhost:5000/api/auth/softwares");
        setSoftwares(res.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des logiciels :", err);
      }
    };
    fetchSoftwares();
  }, []);


      useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get<Home>("http://localhost:5000/api/auth/home", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setHomeData(res.data);
          } catch (err) {
        console.error("Erreur lors de la récupération des stats:", err);
      }
    };

    fetchStats();
  }, [token]);

const handleStartFromHome = (data: {
  difficulty: string;
  software: { id: number; label: string; logo: string };
  system: string;
  mode: "quizz" | "training";
}) => {
  navigate(`/${data.mode}`, {
    state: {
      fromSetup: true,
      setupData: data
    }
  });
};
    return (
        <div className={styles.home}
        style={{
        marginLeft: sidebarVisible ? 'var(--sidebar-w)' : 0,
        transition: 'margin-left 0.3s ease',
      }}
      >

            <section className={styles.heroSection}>
            <h1>Maîtrisez vos raccourcis clavier</h1>
            <p>Apprenez, challengez-vous et devenez un expert des raccourcis clavier pour vos logiciels favoris. Gagnez en productivité et impressionnez vos collègues !</p>
            
            </section>
            <section className={styles.statsSection}>
                    <div className={`${styles.card} ${styles.cardLogin}`}>
                        <div className={styles.crowd}>
                        {Array.from({ length: 9 }).map((_, index) => (
                          <div key={index} className={`${styles.avatar} ${buttonHover && index === 7 ? styles.activeAvatar : ''}`}>
                            <UserAvatarSvg />
                          </div>
                        ))}
                        </div>
                        {!token && 
                        
                        <div>
                        <div className={styles.description}>
                        <div className={styles.value}> <p>{homeData ? homeData.usersCount : "Chargement..."}


                          
                        </p>
                        </div>

                          Rejoins la communauté dès maintenant
                          </div>
                          
                        
                        </div>
                        }
                        <Button className="svgButton" 
                        onMouseEnter={() => {
                        //console.log("HOVER");
                        setButtonHover(true);
                      }}
                        onMouseLeave={() => setButtonHover(false)}
                        onClick={() => window.location.href = '/auth'}>S'inscrire
                        </Button>
                    </div>


                    <div className={`${styles.card} ${styles.cardSoftwares}`}>
                      
                        <div className={styles.description}>
                          <div className={styles.logoScroller}>
                        {softwares
                        .slice(0, 10)
                        .concat(softwares.slice(0, 10)) // duplication pour loop
                        .map((s, index) => (
                          <img key={index} src={s.logo} alt={s.label} className={styles.logoImage} />
                      ))}

                      </div>
                          <h2>Logiciels supportés</h2>
                        <p>{softwares.length} au total</p>
                        
                        <a href="#softwares" className={styles.anchorBtn}>
                          <Button>Voir la liste</Button>
                        </a>
                        <div className={styles.logoScrollerDeux}>
                        {softwares
                        .slice(0, 10)
                        .concat(softwares.slice(0, 10)) // duplication pour loop
                        .map((s, index) => (
                          <img key={index} src={s.logo} alt={s.label} className={styles.logoImage} />
                      ))}

                      </div>
                        </div>
                        
                    </div>
                        


                    <div className={`${styles.card} ${styles.cardUsers}`}>
                      <p>Suis ta progression !</p>
                        <div className={styles.containerLineChart}>
                          <ResponsiveContainer width="100%" height={180}>
                          <LineChart data={mockChartData}>
                            <CartesianGrid
                              stroke="var(--border-tertiary)"
                              strokeDasharray="3 6"
                              opacity={0.4}
                            />
                            <XAxis
                              dataKey="date"
                              tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              domain={[0, 100]}
                              tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                              axisLine={false}
                              tickLine={false}
                              width={30}
                            />
                            <defs>
                              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--solid-primary)" stopOpacity={0.5} />
                                <stop offset="100%" stopColor="var(--solid-primary)" stopOpacity={0.05} />
                              </linearGradient>
                            </defs>
                            <Area
                              type="monotone"
                              dataKey="score"
                              stroke="none"
                              fill="url(#scoreGradient)"
                            />
                            <Line
                              type="monotone"
                              dataKey="score"
                              stroke="var(--solid-primary)"
                              strokeWidth={3}
                              dot={{ r: 4, fill: 'var(--solid-secondary)' }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                        </div>
                        <div> 
                            <p className={styles.description}>Déja <span>{homeData ? homeData.totalSessions : "Chargement..."}</span> sessions jouées, mesure toi aux autres et gravis le classement !</p>
                        </div>
                        
                    </div>
            </section>


            
            
                                        <QuizzSetup
                  onStart={handleStartFromHome}
                  variant="compact"
                />  
                      
            <section className={styles.sectionJolie}></section>
            <section id="softwares" className={styles.softwaresSection}>
              <h2>Liste des logiciels</h2>
              <div className={styles.softwareCards}>
                {softwares.map((s) => (
                  <div
                    key={s.id}
                    className={styles.softwareCard}
                     // plus tard -> navigation
                  >
                    <div className={styles.containerLogoFavorite}>
                      <img src={s.logo} alt={s.label} className={styles.logo} />
                      <motion.span
                        className={styles.favorite}
                        onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }}
                          animate={{ scale: isFavorite ? 1.1 : 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                      >
                        {isFavorite ? <FaStar /> : <FaRegStar />}
                      </motion.span>
                    </div>
                    <div className={styles.containerInfo}>
                      <h3>{s.label}</h3>
                      <p className={styles.categorie}>Design</p>
                    </div>
                    <p>{s.shortcuts_count} raccourcis disponibles</p>
                    
                    <div className={styles.containerButtons}>
                      <Button
                    onClick={() => navigate(`/encyclopedie/${s.id}`)}
                    >Encylopédie
                    </Button>
                    <Button
                      onClick={() =>
                        navigate("/quizz", {
                          state: {
                            preselectedSoftwareId: s.id
                          }
                        })
                      }
                    >
                      Quizz2
                    </Button>
                    <Button
                      onClick={() =>
                        navigate("/training", {
                          state: {
                            preselectedSoftwareId: s.id
                          }
                        })
                      }
                    >
                      Entrainerment2
                    </Button>
                    </div>
                  </div>
                  
                ))}
              </div>
            </section>
<section className={styles.difficultySection}>
            <h2 className={styles.sectionTitle}>Choisissez votre difficulté de jeu</h2>
            <div className={`${styles.cardsWrapper} ${styles.parent}`}>
                <div className={`${styles.difficultyCard} ${styles.div1}`}>
                <div className={styles.cardHeader}>
                    <span className={styles.icon}>⚔️ Apprentissage</span>
                    <h3>Apprend et Mémorise</h3>
                    <h4>Voir les softwares disponibles </h4>
                </div>
                <div className={styles.cardContent}>
                  <div>
                    <p className={styles.cardDescription}>Découvrez à votre rythme</p>
                    <ul className={styles.featuresList}>
                      <li>Pas de limite de temps</li>
                      <li>Parfait pour apprendre</li>
                      <li>Solution possible</li>
                  </ul>
                  </div>
                
                </div>
                <div className={styles.cardButtonContainer}>
                    <p className={styles.cardDescription}>Découvrez à votre rythme</p>

                  <Button>Commencer</Button>
                </div>
                </div>
              <div className={`${styles.difficultyCard} ${styles.div2}`}>
                <div className={styles.cardHeader}>
                  <span className={styles.icon}>⚔️ Challenge</span>
                  <h3>Teste ton niveau</h3>
                  <h4>Rapidité & précision</h4>
                </div>

                <div className={styles.cardContent}>
                  <div>
                    <p className={styles.cardDescription}>Un mode nerveux pour te dépasser</p>
                    <ul className={styles.featuresList}>
                      <li>Pas d’explication pendant la partie</li>
                      <li>Score basé sur la rapidité</li>
                      <li>Les erreurs ne bloquent pas la session</li>
                    </ul>
                  </div>
                </div>

                <div className={styles.cardButtonContainer}>
                  <p className={styles.cardDescription}>Idéal pour se challenger</p>
                  <Button>Commencer</Button>
                </div>
              </div>
              <div className={`${styles.difficultyCard} ${styles.div3}`}>
                <div className={styles.cardHeader}>
                  <span className={styles.icon}>💀 Hardcore</span>
                  <h3>Survis si tu peux</h3>
                  <h4>Réservé aux experts</h4>
                </div>

                <div className={styles.cardContent}>
                  <div>
                    <p className={styles.cardDescription}>Tolérance zéro</p>
                    <ul className={styles.featuresList}>
                      <li>Une seule erreur autorisée</li>
                      <li>Aucun indice, aucune aide</li>
                      <li>La session s’arrête immédiatement</li>
                    </ul>
                  </div>
                </div>

                <div className={styles.cardButtonContainer}>
                  <p className={styles.cardDescription}>Mode ultra punitif</p>
                  <Button>Commencer</Button>
                </div>
              </div>
                <div className={`${styles.ctaCard} ${styles.div4}`}>
                <div className={styles.cardHeader}>
                    <span className={styles.icon}>🎓</span>
                    <h3>CTA DEBUT</h3>
                </div>
                <p className={styles.cardDescription}>CTA DEBUT</p>
                <ul className={styles.featuresList}>
                    <li>CTA DEBUT</li>
                    <li>CTA DEBUT</li>
                    <li>CTA DEBUT</li>
                </ul>
                <Button onClick={() => window.location.href = '/quizz'}>Commencer le quizz</Button>
                <Button onClick={() => window.location.href = '/training'}>Commencer l'entrainement</Button>
                </div>
            </div>
            </section>
        </div>
    );
};

export default Home;