import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import { 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  Phone, 
  Book
} from 'lucide-react';

const HelpSupport = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [openFaqId, setOpenFaqId] = useState(null);

  const handleBack = () => {
    navigate(-1);
  };

  const faqs = [
    {
      id: 1,
      question: "How do I create a new project?",
      answer: "To create a new project, click on the 'My Projects' section in the sidebar, then click the 'Add Project' button. Fill in the project details in the form and click 'Create Project'."
    },
    {
      id: 2,
      question: "How do I add team members to my project?",
      answer: "Navigate to your project, click on the 'Team' tab, and use the 'Add Member' button. You can search for users by their email or username and assign them specific roles."
    },
    {
      id: 3,
      question: "How do I track my tasks?",
      answer: "You can view all your assigned tasks in the 'My Tasks' section. Each task shows its deadline, priority, and status. Click on a task to view more details or update its status."
    },
    {
      id: 4,
      question: "Can I customize my notification settings?",
      answer: "Yes, you can customize your notification preferences in the Settings menu. You can choose which types of notifications you want to receive and how you want to receive them."
    },
    {
      id: 5,
      question: "How do I generate project reports?",
      answer: "In your project dashboard, click on the 'Reports' tab. You can select different report types, date ranges, and export formats to generate detailed project reports."
    }
  ];

  const resources = [
    {
      id: 1,
      title: "Getting Started Guide",
      description: "Learn the basics of using our project management system",
      icon: Book,
      link: "#"
    }
  ];

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const content = (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header with Back Button */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={handleBack}
              className={`p-2 rounded-lg transition-all duration-200 ${
                darkMode 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Help & Support
            </h1>
          </div>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Find answers to common questions and get support when you need it.
          </p>
        </div>

        {/* Contact Options */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-8`}>
          {/* Email Support */}
          <div className={`p-6 rounded-lg border ${
            darkMode ? 'bg-gray-800 border-purple-500/30' : 'bg-white border-gray-200'
          }`}>
            <div className="flex flex-col items-center text-center">
              <Mail className={`w-8 h-8 mb-3 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Email Support
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                support@task.io
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Response within 24 hours
              </p>
            </div>
          </div>

          {/* Phone Support */}
          <div className={`p-6 rounded-lg border ${
            darkMode ? 'bg-gray-800 border-purple-500/30' : 'bg-white border-gray-200'
          }`}>
            <div className="flex flex-col items-center text-center">
              <Phone className={`w-8 h-8 mb-3 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Phone Support
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                +1 (555) 123-4567
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Mon-Fri, 9 AM - 5 PM
              </p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className={`border rounded-lg ${
                  darkMode ? 'bg-gray-800 border-purple-500/30' : 'bg-white border-gray-200'
                }`}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between focus:outline-none"
                >
                  <span className={`font-medium text-left ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {faq.question}
                  </span>
                  {openFaqId === faq.id ? (
                    <ChevronUp className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
                  ) : (
                    <ChevronDown className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
                  )}
                </button>
                {openFaqId === faq.id && (
                  <div className={`px-6 pb-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div>
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Resources
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {resources.map((resource) => (
              <a
                key={resource.id}
                href={resource.link}
                className={`p-6 rounded-lg border transition-all duration-200 ${
                  darkMode 
                    ? 'bg-gray-800 border-purple-500/30 hover:bg-gray-700' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <resource.icon className={`w-8 h-8 mb-3 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {resource.title}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {resource.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return <Layout>{content}</Layout>;
};

export default HelpSupport; 