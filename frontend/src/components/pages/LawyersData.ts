interface Case {
  title: string;
  description: string;
  year: number;
  outcome: "won" | "lost";
  impact: string;
}

export interface Lawyer {
  Name: string;
  Specialization: string;
  Years_of_Experience: number;
  Number_of_Cases_Solved: number;
  Location: string;
  Email: string;
  cases_won: number;
  cases_lost: number;
  famous_cases: Case[];
}

const lawyers: Lawyer[] = [
  {
    Name: "Rajesh Gupta",
    Specialization: "Criminal Law",
    Years_of_Experience: 18,
    Number_of_Cases_Solved: 200,
    Location: "New Delhi",
    Email: "rajesh.gupta@lawfirm.com",
    cases_won: 160,
    cases_lost: 40,
    famous_cases: [
      {
        title: "State vs. Vikram Singh",
        description: "A high-profile murder case involving a political figure",
        year: 2020,
        outcome: "won",
        impact: "Strengthened forensic evidence procedures in trials",
      },
      {
        title: "Delhi Riots Case",
        description: "Legal battle over communal violence in Delhi",
        year: 2021,
        outcome: "won",
        impact: "Led to stricter riot control policies",
      },
    ],
  },
  {
    Name: "Sneha Iyer",
    Specialization: "Corporate Law",
    Years_of_Experience: 12,
    Number_of_Cases_Solved: 140,
    Location: "Bengaluru",
    Email: "sneha.iyer@corporatelaw.com",
    cases_won: 110,
    cases_lost: 30,
    famous_cases: [
      {
        title: "MNC vs. Employee Rights Case",
        description: "Landmark case on wrongful termination of employees",
        year: 2019,
        outcome: "won",
        impact: "Set new regulations for labor rights in tech companies",
      },
    ],
  },
  {
    Name: "Amitabh Deshmukh",
    Specialization: "Civil Law",
    Years_of_Experience: 20,
    Number_of_Cases_Solved: 250,
    Location: "Mumbai",
    Email: "amitabh.deshmukh@civillaw.com",
    cases_won: 210,
    cases_lost: 40,
    famous_cases: [
      {
        title: "Mumbai Coastal Development Case",
        description: "Case against illegal land acquisition along Mumbai's coastline",
        year: 2020,
        outcome: "won",
        impact: "Prevented destruction of key marine ecosystems",
      },
    ],
  },
  {
    Name: "Pooja Reddy",
    Specialization: "Family Law",
    Years_of_Experience: 14,
    Number_of_Cases_Solved: 180,
    Location: "Hyderabad",
    Email: "pooja.reddy@familylaw.com",
    cases_won: 140,
    cases_lost: 40,
    famous_cases: [
      {
        title: "Landmark Custody Case",
        description: "A complex custody battle that set new legal precedents",
        year: 2021,
        outcome: "won",
        impact: "Improved legal rights for single parents",
      },
    ],
  },
  {
    Name: "Deepak Sharma",
    Specialization: "Intellectual Property Law",
    Years_of_Experience: 10,
    Number_of_Cases_Solved: 120,
    Location: "Chennai",
    Email: "deepak.sharma@iplaw.com",
    cases_won: 95,
    cases_lost: 25,
    famous_cases: [
      {
        title: "Bollywood Copyright Dispute",
        description: "High-profile copyright battle in the Indian film industry",
        year: 2022,
        outcome: "won",
        impact: "Strengthened copyright laws for artists",
      },
    ],
  },
  {
    Name: "Vikram Mehta",
    Specialization: "Cyber Law",
    Years_of_Experience: 9,
    Number_of_Cases_Solved: 90,
    Location: "Pune",
    Email: "vikram.mehta@cyberlaw.com",
    cases_won: 75,
    cases_lost: 15,
    famous_cases: [
      {
        title: "Online Data Breach Case",
        description: "A major cyber fraud case involving financial theft",
        year: 2021,
        outcome: "won",
        impact: "Led to stricter cybersecurity regulations",
      },
    ],
  },
  {
    Name: "Meera Choudhary",
    Specialization: "Human Rights Law",
    Years_of_Experience: 16,
    Number_of_Cases_Solved: 130,
    Location: "Kolkata",
    Email: "meera.choudhary@humanrights.com",
    cases_won: 110,
    cases_lost: 20,
    famous_cases: [
      {
        title: "Refugee Rights Case",
        description: "Legal battle ensuring rights for refugee communities",
        year: 2020,
        outcome: "won",
        impact: "Set legal protections for asylum seekers in India",
      },
    ],
  },
  {
    Name: "Aniket Joshi",
    Specialization: "Tax Law",
    Years_of_Experience: 15,
    Number_of_Cases_Solved: 170,
    Location: "Ahmedabad",
    Email: "aniket.joshi@taxlaw.com",
    cases_won: 140,
    cases_lost: 30,
    famous_cases: [
      {
        title: "GST Evasion Case",
        description: "Major case against corporate tax fraud",
        year: 2019,
        outcome: "won",
        impact: "Strengthened GST enforcement mechanisms",
      },
    ],
  },
  {
    Name: "Sunita Nair",
    Specialization: "Environmental Law",
    Years_of_Experience: 13,
    Number_of_Cases_Solved: 100,
    Location: "Thiruvananthapuram",
    Email: "sunita.nair@envlaw.com",
    cases_won: 85,
    cases_lost: 15,
    famous_cases: [
      {
        title: "Kerala Backwaters Conservation Case",
        description: "Legal action against illegal sand mining",
        year: 2022,
        outcome: "won",
        impact: "Strengthened conservation policies for water bodies",
      },
    ],
  },
  {
    Name: "Aditya Mishra",
    Specialization: "Labor Law",
    Years_of_Experience: 19,
    Number_of_Cases_Solved: 220,
    Location: "Lucknow",
    Email: "aditya.mishra@laborlaw.com",
    cases_won: 180,
    cases_lost: 40,
    famous_cases: [
      {
        title: "Minimum Wage Violation Case",
        description: "Landmark case against a major industrial company",
        year: 2021,
        outcome: "won",
        impact: "Increased minimum wage laws enforcement",
      },
    ],
  },
  {
    Name: "Kiran Patil",
    Specialization: "Constitutional Law",
    Years_of_Experience: 22,
    Number_of_Cases_Solved: 260,
    Location: "Nagpur",
    Email: "kiran.patil@constitutionallaw.com",
    cases_won: 230,
    cases_lost: 30,
    famous_cases: [
      {
        title: "Freedom of Speech Case",
        description: "Fought for the rights of journalists",
        year: 2018,
        outcome: "won",
        impact: "Expanded press freedom protections",
      },
    ],
  }
];

export default lawyers;








// interface Case {
//     title: string;
//     description: string;
//     year: number;
//     outcome: 'won' | 'lost';
//     impact: string;
//   }
  
//   export interface Lawyer {
//     Name: string;
//     Specialization: string;
//     Years_of_Experience: number;
//     Number_of_Cases_Solved: number;
//     Location: string;
//     Email: string;
//     cases_won: number;
//     cases_lost: number;
//     famous_cases: Case[];
//   }
  
//   const lawyers: Lawyer[] = [
//     {
//       Name: "Ravi Sharma",
//       Specialization: "Criminal Law",
//       Years_of_Experience: 15,
//       Number_of_Cases_Solved: 150,
//       Location: "Delhi",
//       Email: "ravi.sharma@lawyer.com",
//       cases_won: 120,
//       cases_lost: 30,
//       famous_cases: [
//         {
//           title: "State vs. Kumar Murder Case",
//           description: "High-profile murder case involving a business tycoon",
//           year: 2019,
//           outcome: "won",
//           impact: "Set precedent for circumstantial evidence interpretation"
//         },
//         {
//           title: "Delhi Gang Violence Case",
//           description: "Complex case involving multiple defendants in organized crime",
//           year: 2020,
//           outcome: "won",
//           impact: "Led to major police reforms"
//         }
//       ]
//     },
//     {
//       Name: "Priya Verma",
//       Specialization: "Civil Law",
//       Years_of_Experience: 10,
//       Number_of_Cases_Solved: 120,
//       Location: "Mumbai",
//       Email: "priya.verma@lawyer.com",
//       cases_won: 95,
//       cases_lost: 25,
//       famous_cases: [
//         {
//           title: "Heritage Building Preservation Case",
//           description: "Landmark case protecting historical architecture",
//           year: 2021,
//           outcome: "won",
//           impact: "Strengthened heritage conservation laws"
//         }
//       ]
//     },
//     // ... Add similar data for other lawyers
//   ];
  
//   export default lawyers;