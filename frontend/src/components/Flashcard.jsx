import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Flashcard({ card, onAnswer, isFlipped: externalFlipped, onFlip }) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = () => {
    const newFlipped = !isFlipped
    setIsFlipped(newFlipped)
    if (onFlip) onFlip(newFlipped)
  }

  const displayFlipped = externalFlipped !== undefined ? externalFlipped : isFlipped

  return (
    <div className="perspective-1000">
      <motion.div
        className="relative w-full h-96 cursor-pointer"
        onClick={handleFlip}
        animate={{ rotateY: displayFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 backface-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: displayFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl shadow-2xl flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-white text-2xl font-semibold">{card.front}</p>
              <p className="text-primary-100 mt-4 text-sm">Click to flip</p>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 backface-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: displayFlipped ? 'rotateY(0deg)' : 'rotateY(-180deg)',
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-green-500 to-green-700 rounded-xl shadow-2xl flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-white text-2xl font-semibold">{card.back}</p>
              <p className="text-green-100 mt-4 text-sm">How well did you know this?</p>
            </div>
          </div>
        </div>
      </motion.div>

      {displayFlipped && (
        <div className="mt-6 flex justify-center gap-4">
          {[0, 1, 2, 3, 4, 5].map((quality) => (
            <button
              key={quality}
              onClick={(e) => {
                e.stopPropagation()
                onAnswer(card.id, quality)
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                quality < 3
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : quality < 5
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {quality}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

