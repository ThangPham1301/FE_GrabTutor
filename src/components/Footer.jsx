import React from "react";

export default function Footer() {
  const brands = [
    { name: "IXL", desc: "Comprehensive K-12 personalized learning" },
    { name: "Rosetta Stone", desc: "Immersive learning for 25 languages" },
    { name: "Wyzant", desc: "Trusted tutors for 300 subjects" },
    { name: "Education.com", desc: "35,000 worksheets, games, and lesson plans" },
    { name: "Vocabulary.com", desc: "Adaptive learning for English vocabulary" },
    { name: "Emmersion", desc: "Fast and accurate language certification" },
    { name: "Thesaurus.com", desc: "Essential reference for synonyms and antonyms" },
    { name: "Dictionary.com", desc: "Comprehensive resource for word definitions and usage" },
    { name: "SpanishDictionary.com", desc: "Spanish-English dictionary, translator, and learning resources" },
    { name: "FrenchDictionary.com", desc: "French-English dictionary, translator, and learning" },
    { name: "Ingles.com", desc: "Diccionario ingles-espanol, traductor y sitio de aprendizaje" },
    { name: "ABCya", desc: "Fun educational games for kids" },
  ];

  return (
    <footer className="bg-[#fff9f5] text-gray-800 mt-12">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Title */}
        <h2 className="text-center text-xl font-semibold mb-12">
          MyTutor is part of the IXL family of brands:
        </h2>

        {/* Brands grid */}
        <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-10 text-center">
          {brands.map((brand, idx) => (
            <div key={idx} className="border-gray-200 px-4">
              <h3 className="font-bold text-lg">{brand.name}</h3>
              <p className="text-sm text-gray-600 mt-2">{brand.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="text-center text-sm text-gray-600 py-6 border-t border-gray-200">
        © 2025 by IXL Learning
      </div>
    </footer>
  );
}
