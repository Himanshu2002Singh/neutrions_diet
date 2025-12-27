import { useState } from 'react';
import { X, Clock, Target, Zap } from 'lucide-react';

/* ================= TYPES ================= */

interface ExerciseStep {
  text: string;
  image: string;
}

interface Exercise {
  id: string;
  name: string;
  image: string;
  category: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  calories: number;
  steps: ExerciseStep[];
  tips: string[];
}

/* ================= COMPONENT ================= */

export function WorkoutPlans() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  /* ================= DATA ================= */

  const exercises: Exercise[] = [
    {
      id: '1',
      name: 'Push-ups',
      image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00',
      category: 'Upper Body',
      duration: '10-15 mins',
      difficulty: 'Beginner',
      calories: 50,
      steps: [
        {
          text: 'Start in a plank position with hands wider than shoulders',
          image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e'
        },
        {
          text: 'Keep your body straight from head to heels',
          image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1'
        },
        {
          text: 'Lower chest close to the floor',
          image: 'https://images.unsplash.com/photo-1590487988256-9ed24133863e'
        },
        {
          text: 'Push back to starting position',
          image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61'
        }
      ],
      tips: [
        'Engage your core',
        'Do not flare elbows',
        'Exhale while pushing up'
      ]
    },

    {
      id: '2',
      name: 'Squats',
      image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155',
      category: 'Lower Body',
      duration: '15-20 mins',
      difficulty: 'Beginner',
      calories: 60,
      steps: [
        {
          text: 'Stand with feet shoulder-width apart',
          image: 'https://images.unsplash.com/photo-1605296866985-34e4a66b7e8b'
        },
        {
          text: 'Push hips back and bend knees',
          image: 'https://images.unsplash.com/photo-1599058917765-2b3d5d27f0b1'
        },
        {
          text: 'Lower thighs parallel to floor',
          image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c'
        },
        {
          text: 'Drive through heels to stand',
          image: 'https://images.unsplash.com/photo-1594737625785-c9fcd90c01bb'
        }
      ],
      tips: [
        'Keep chest up',
        'Knees aligned with toes',
        'Weight on heels'
      ]
    },

    {
      id: '3',
      name: 'Plank',
      image: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6',
      category: 'Core',
      duration: '5-10 mins',
      difficulty: 'Beginner',
      calories: 30,
      steps: [
        {
          text: 'Start in push-up position',
          image: 'https://images.unsplash.com/photo-1594737625785-c9fcd90c01bb'
        },
        {
          text: 'Lower onto forearms',
          image: 'https://images.unsplash.com/photo-1605296866985-34e4a66b7e8b'
        },
        {
          text: 'Keep body straight and core tight',
          image: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6'
        },
        {
          text: 'Hold and breathe normally',
          image: 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1'
        }
      ],
      tips: [
        'Do not sag hips',
        'Engage abs',
        'Start with 30 seconds'
      ]
    },

    {
      id: '4',
      name: 'Jumping Jacks',
      image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1',
      category: 'Cardio',
      duration: '5-10 mins',
      difficulty: 'Beginner',
      calories: 80,
      steps: [
        {
          text: 'Stand straight with arms at sides',
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b'
        },
        {
          text: 'Jump and spread legs while raising arms',
          image: 'https://images.unsplash.com/photo-1594737625785-c9fcd90c01bb'
        },
        {
          text: 'Clap hands overhead',
          image: 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1'
        },
        {
          text: 'Jump back to start position',
          image: 'https://images.unsplash.com/photo-1605296866985-34e4a66b7e8b'
        }
      ],
      tips: [
        'Land softly',
        'Maintain rhythm',
        'Breathe steadily'
      ]
    },


    {
      id: '4',
      name: 'Jumping Jacks',
      image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1',
      category: 'Cardio',
      duration: '5-10 mins',
      difficulty: 'Beginner',
      calories: 80,
      steps: [
        {
          text: 'Stand straight with arms at sides',
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b'
        },
        {
          text: 'Jump and spread legs while raising arms',
          image: 'https://images.unsplash.com/photo-1594737625785-c9fcd90c01bb'
        },
        {
          text: 'Clap hands overhead',
          image: 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1'
        },
        {
          text: 'Jump back to start position',
          image: 'https://images.unsplash.com/photo-1605296866985-34e4a66b7e8b'
        }
      ],
      tips: [
        'Land softly',
        'Maintain rhythm',
        'Breathe steadily'
      ]
    },

    {
      id: '5',
      name: 'Anulom Vilom Pranayama',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b',
      category: 'Yoga & Breathing',
      duration: '10-15 mins',
      difficulty: 'Beginner',
      calories: 20,
      steps: [
        {
          text: 'Sit in a comfortable cross-legged position',
          image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773'
        },
        {
          text: 'Close right nostril with thumb, inhale through left',
          image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0'
        },
        {
          text: 'Close left nostril with ring finger, exhale through right',
          image: 'https://images.unsplash.com/photo-1588286840104-8957b019727f'
        },
        {
          text: 'Inhale through right, then exhale through left',
          image: 'https://images.unsplash.com/photo-1545389336-cf090694435e'
        }
      ],
      tips: [
        'Keep spine straight',
        'Breathe slowly and deeply',
        'Practice on empty stomach'
      ]
    },

    {
      id: '6',
      name: 'Surya Namaskar',
      image: 'https://images.unsplash.com/photo-1588286840104-8957b019727f',
      category: 'Yoga & Breathing',
      duration: '15-20 mins',
      difficulty: 'Intermediate',
      calories: 90,
      steps: [
        {
          text: 'Stand in prayer position (Pranamasana)',
          image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773'
        },
        {
          text: 'Raise arms and arch back (Hasta Uttanasana)',
          image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0'
        },
        {
          text: 'Bend forward touching feet (Padahastasana)',
          image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b'
        },
        {
          text: 'Step back to plank, lower to floor (Ashtanga Namaskara)',
          image: 'https://images.unsplash.com/photo-1545389336-cf090694435e'
        }
      ],
      tips: [
        'Synchronize with breath',
        'Start with 5 rounds',
        'Best done at sunrise'
      ]
    },

    {
      id: '7',
      name: 'Kapalbhati Pranayama',
      image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0',
      category: 'Yoga & Breathing',
      duration: '5-10 mins',
      difficulty: 'Beginner',
      calories: 25,
      steps: [
        {
          text: 'Sit comfortably with spine erect',
          image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773'
        },
        {
          text: 'Take a deep breath in',
          image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b'
        },
        {
          text: 'Exhale forcefully by contracting abdomen',
          image: 'https://images.unsplash.com/photo-1588286840104-8957b019727f'
        },
        {
          text: 'Allow passive inhalation, repeat rapidly',
          image: 'https://images.unsplash.com/photo-1545389336-cf090694435e'
        }
      ],
      tips: [
        'Focus on exhalation',
        'Start with 30 strokes',
        'Avoid if pregnant'
      ]
    },

    {
      id: '8',
      name: 'Lunges',
      image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b',
      category: 'Lower Body',
      duration: '10-15 mins',
      difficulty: 'Intermediate',
      calories: 70,
      steps: [
        {
          text: 'Stand with feet hip-width apart',
          image: 'https://images.unsplash.com/photo-1605296866985-34e4a66b7e8b'
        },
        {
          text: 'Step forward with right leg',
          image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e'
        },
        {
          text: 'Lower hips until both knees are at 90 degrees',
          image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b'
        },
        {
          text: 'Push back to starting position',
          image: 'https://images.unsplash.com/photo-1594737625785-c9fcd90c01bb'
        }
      ],
      tips: [
        'Keep front knee over ankle',
        'Engage your core',
        'Alternate legs'
      ]
    },

    {
      id: '9',
      name: 'Mountain Climbers',
      image: 'https://images.unsplash.com/photo-1599058917765-2b3d5d27f0b1',
      category: 'Cardio',
      duration: '5-10 mins',
      difficulty: 'Intermediate',
      calories: 100,
      steps: [
        {
          text: 'Start in high plank position',
          image: 'https://images.unsplash.com/photo-1594737625785-c9fcd90c01bb'
        },
        {
          text: 'Bring right knee toward chest',
          image: 'https://images.unsplash.com/photo-1599058917765-2b3d5d27f0b1'
        },
        {
          text: 'Quickly switch legs',
          image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1'
        },
        {
          text: 'Continue alternating at a running pace',
          image: 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1'
        }
      ],
      tips: [
        'Keep hips level',
        'Maintain plank form',
        'Breathe rhythmically'
      ]
    },

    {
      id: '10',
      name: 'Bicycle Crunches',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
      category: 'Core',
      duration: '10-15 mins',
      difficulty: 'Intermediate',
      calories: 55,
      steps: [
        {
          text: 'Lie on back with hands behind head',
          image: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6'
        },
        {
          text: 'Lift shoulders and bend knees',
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b'
        },
        {
          text: 'Bring right elbow to left knee',
          image: 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1'
        },
        {
          text: 'Switch sides in a pedaling motion',
          image: 'https://images.unsplash.com/photo-1594737625785-c9fcd90c01bb'
        }
      ],
      tips: [
        'Twist from core',
        'Keep lower back pressed down',
        'Move slowly with control'
      ]
    }
  ];

  const categories = ['All', 'Upper Body', 'Lower Body', 'Core', 'Cardio'];

  const filteredExercises =
    selectedCategory === 'All'
      ? exercises
      : exercises.filter(e => e.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === 'Beginner') return 'bg-green-100 text-green-600';
    if (difficulty === 'Intermediate') return 'bg-yellow-100 text-yellow-600';
    return 'bg-red-100 text-red-600';
  };

  /* ================= UI ================= */

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Workout Plans</h1>

      {/* Categories */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedCategory === cat
                ? 'bg-[#C5E17A] text-black'
                : 'bg-gray-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map(ex => (
          <div
            key={ex.id}
            onClick={() => setSelectedExercise(ex)}
            className="bg-white rounded-xl shadow hover:shadow-lg cursor-pointer"
          >
            <img src={ex.image} className="h-48 w-full object-cover rounded-t-xl" />
            <div className="p-5">
              <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(ex.difficulty)}`}>
                {ex.difficulty}
              </span>
              <h3 className="text-xl font-semibold mt-2">{ex.name}</h3>
              <p className="text-gray-500">{ex.category}</p>

              <div className="flex gap-4 text-sm mt-3 text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock size={16} /> {ex.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Zap size={16} /> {ex.calories} cal
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
          <div className="bg-white max-w-3xl w-full rounded-xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-2xl font-bold">{selectedExercise.name}</h2>
              <X className="cursor-pointer" onClick={() => setSelectedExercise(null)} />
            </div>

            <div className="p-6">
              <img
                src={selectedExercise.image}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />

              <h3 className="text-xl font-semibold mb-4">How to Perform</h3>

              <div className="space-y-5">
                {selectedExercise.steps.map((step, i) => (
                  <div key={i} className="flex flex-col md:flex-row gap-4 bg-gray-50 p-4 rounded-lg">
                    <img
                      src={step.image}
                      className="w-full md:w-48 h-32 object-cover rounded"
                    />
                    <div className="flex gap-3">
                      <span className="w-7 h-7 bg-[#C5E17A] rounded-full flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <p>{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="text-xl font-semibold mt-6 mb-3">Pro Tips</h3>
              <ul className="space-y-2">
                {selectedExercise.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2">
                    <Target className="text-[#C5E17A]" /> {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
