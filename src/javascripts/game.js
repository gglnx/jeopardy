import React from 'react';
import ReactDOM from 'react-dom';
import Game from './components/Game.jsx';

// Game content
import stoererhaftung from '../gamecontent/stoererhaftung.png';
import gema from '../gamecontent/gema.png';
import netzneutralitaet from '../gamecontent/netzneutralitaet.png';
import pseudonymisierung from '../gamecontent/pseudonymisierung.png';
import urheberrechte from '../gamecontent/urheberrechte.png';
import verkehrsdaten from '../gamecontent/verkehrsdaten.png';
import weltraumtheorie from '../gamecontent/weltraumtheorie.png';
import DigiDoroHint from '../gamecontent/DigiDoro_Hint.mp4';
import DigiDoroLoesung from '../gamecontent/DigiDoro_Loesung.mp4';
import PersonenbezogeneDaten from '../gamecontent/Personenbezogene_Daten.mp4';
import Dritte from '../gamecontent/Dritte.mp4';
import MerkelHint from '../gamecontent/Merkel_Hint.mp4';
import MerkelLoesung from '../gamecontent/Merkel_Loesung.mp4';
import ProfallaHint from '../gamecontent/Profalla_Hint.mp4';
import ProfallaLoesung from '../gamecontent/Profalla_Loesung.mp4';
import DieMesereHint from '../gamecontent/Die_Mesere_Hint.mp4';
import DieMesereLoesung from '../gamecontent/Die_Mesere_Loesung.mp4';

const gameData = {
  id: 'round1',
  title: 'Logbuch Netzpolitik 256',
  values: [100, 200, 300, 400, 500],
  bonusCategory: 'Kategorie X',
  categories: {
    'LNP Klassiker': [
      {
        answer: {
          type: 'image',
          content: stoererhaftung,
        },
      },
      {
        answer: {
          type: 'image',
          content: netzneutralitaet,
        },
      },
      {
        answer: {
          type: 'image',
          content: urheberrechte,
        },
      },
      {
        answer: {
          type: 'image',
          content: gema,
        },
      },
      {
        answer: {
          type: 'image',
          content: weltraumtheorie,
        },
      },
    ],
    Politikerzitate: [
      {
        answer: {
          type: 'text',
          content: 'Dieses Land ermöglicht auch Feinden und Gegnern unserer demokratischen Grundordnung mit völlig neuen Möglichkeiten und völlig neuen Herangehensweisen unsere Art zu Leben in Gefahr zu bringen.',
        },
        hint: {
          type: 'video',
          content: MerkelHint,
        },
        solution: {
          type: 'video',
          content: MerkelLoesung,
        },
      },
      {
        answer: {
          type: 'text',
          content: 'Wir richten ja auch jährlich den Hafengeburtstag aus. Es wird Leute geben, die sich am 9. Juli wundern werden, dass der … schon vorbei ist.',
        },
      },
      {
        answer: {
          type: 'text',
          content: '…deswegen haben wir auch ein Gigabit-Programm für unsere Gewerbegebiete, aber das Thema muss doch sein, kann ich auf die Infrastruktur die wir dort haben auch mal autonom fahren…',
        },
        hint: {
          type: 'video',
          content: DigiDoroHint,
        },
        solution: {
          type: 'video',
          content: DigiDoroLoesung,
        },
      },
      {
        answer: {
          type: 'text',
          content: '…ist nach den Angaben der NSA, des britischen Dienstes und unserer Nachrichtendienste vom Tisch…',
        },
        hint: {
          type: 'video',
          content: ProfallaHint,
        },
        solution: {
          type: 'video',
          content: ProfallaLoesung,
        },
      },
      {
        answer: {
          type: 'text',
          content: 'was genau war denn der Hintergrund der Gefährdung, was hätte passieren können, wovor… was war der… was war der Gefährdungsgrund warum sie abgesagt hat, was war der zeitliche Ablauf, dass die Entscheidung nachher so klar war wie wir beide sie getroffen haben? Ich verstehe diese Fragen, aber verstehen Sie bitte, dass ich darauf keine Antwort geben möchte! Warum?',
        },
        hint: {
          type: 'video',
          content: DieMesereHint,
        },
        solution: {
          type: 'video',
          content: DieMesereLoesung,
        },
      },
    ],
    DSGVO: [
      {
        answer: {
          type: 'video',
          content: PersonenbezogeneDaten,
        },
      },
      {
        answer: {
          type: 'image',
          content: pseudonymisierung,
        },
      },
      {
        answer: {
          type: 'image',
          content: verkehrsdaten,
        },
        daily: true,
      },
      {
        answer: {
          type: 'text',
          content: 'jede freiwillig für den bestimmten Fall, in informierter Weise und unmissverständlich abgegebene Willensbekundung in Form einer Erklärung oder einer sonstigen eindeutigen bestätigenden Handlung, mit der die betroffene Person zu verstehen gibt, dass sie mit der Verarbeitung der sie betreffenden personenbezogenen Daten einverstanden ist',
        },
      },
      {
        answer: {
          type: 'video',
          content: Dritte,
        },
      },
    ],
    Prophezeihungen: [
      {
        answer: {
          type: 'text',
          content: 'Mehr als 640 Kilobyte Speicher werden Sie niemals benötigen',
        },
      },
      {
        answer: {
          type: 'text',
          content: 'Das Internet ist eine Spielerei für Computerfreaks, wir sehen darin keine Zukunft.',
        },
      },
      {
        answer: {
          type: 'text',
          content: 'Wir haben das Internet als interaktives Medium überschätzt.',
        },
      },
      {
        answer: {
          type: 'text',
          content: 'Die Technologiekonzerne Electrolux und Ericsson arbeiten unter Hochdruck an einem internettauglichen Kühlschrank. Dieser bestellt selbstständig Joghurts im Supermarkt nach und warnt, bevor die Milch sauer wird. Schon nächstes Jahr sollen Prototypen in 200 dänischen Haushalten getestet werden.',
        },
      },
      {
        answer: {
          type: 'text',
          content: 'In zwei Jahren wird das Spam-Problem gelöst sein.',
        },
      },
    ],
    Entwicklungsländer: [
      {
        answer: {
          type: 'text',
          content: 'In diesem Land soll es bis 2050 WLAN in allen Fahrzeugen, eine Digitalisierung der Infrastruktur, eine einheitliche Tarifstruktur sowie abgestimmte Fahrpläne geben.',
        },
      },
      {
        answer: {
          type: 'text',
          content: 'In diesem Land wurde erst 2018 eine unbeschränkte mobile Datenflatrate für Privatkunden eingeführt.',
        },
      },
      {
        answer: {
          type: 'text',
          content: 'In diesem Land wurden im Jahr 2009 die öffentlich-rechtlichen Sender zum Depublizieren der meisten ihrer Online verfügbaren Audio- und Videoinhalte nach sieben Tagen gezwungen.',
        },
      },
      {
        answer: {
          type: 'text',
          content: 'In diesem Land erreicht man durch Vectoring von Kupfer Glasfaser ‘Geschwindigkeiten’ und ermöglicht Millionen Menschen schnelles Internet.',
        },
      },
      {
        answer: {
          type: 'text',
          content: 'In welchem Land dürfen Handys mit dem Bundestrojaner infiltriert werden, sind anonyme Sim-Karten verboten und Behörden erhalten Zugriff  auf Videokameras im öffentlichen Raum?',
        },
        daily: true,
      },
    ],
  },
};

const $mount = document.getElementById('game');
ReactDOM.render(<Game gameData={gameData} />, $mount);
