// "use client"
//
// import { useState } from 'react';
// import { Dialog } from '@headlessui/react';
//
// const researchTopics = [
//     {
//         title: 'Node/Edge/Graph Embedding with Graph Neural Networks',
//         description: 'Graph Neural Networks (GNNs) are used to create embeddings for nodes, edges, and graphs. These embeddings are crucial for network analysis, recommendation systems, social network analysis, and more.',
//     },
//     {
//         title: 'Graph Construction from (Un/Semi)Structured Data',
//         description: 'Constructing graphs from unstructured and semi-structured data enables better analysis and understanding by transforming text, log data, sensor data, etc., into graph formats.',
//     },
//     {
//         title: 'Context-aware Relational Learning for Knowledge Graphs',
//         description: 'Performing relational learning in knowledge graphs with context-awareness is essential for applications such as knowledge graph-based question answering and recommendation systems.',
//     },
//     {
//         title: 'Open-World Knowledge Graph Reasoning for Unseen Entities and Relations',
//         description: 'Open-world reasoning in knowledge graphs deals with new entities and relations, making it valuable for continuously expanding data environments.',
//     },
//     // 다른 주제들도 여기에 추가
// ];
//
// export default function ResearchTopics() {
//     const [isOpen, setIsOpen] = useState(false);
//     const [currentDescription, setCurrentDescription] = useState('');
//
//     const openModal = (description) => {
//         setCurrentDescription(description);
//         setIsOpen(true);
//     };
//
//     const closeModal = () => {
//         setIsOpen(false);
//     };
//
//     return (
//         <div className="container mx-auto py-8">
//             <div className="space-y-6">
//                 {researchTopics.map((topic, index) => (
//                     <div key={index} className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow">
//                         <p className="text-gray-700">{topic.title}</p>
//                         <button
//                             className="bg-blue-500 text-white px-4 py-2 rounded-lg"
//                             onClick={() => openModal(topic.description)}
//                         >
//                             Info
//                         </button>
//                     </div>
//                 ))}
//             </div>
//
//             <Dialog open={isOpen} onClose={closeModal} className="fixed z-10 inset-0 overflow-y-auto">
//                 <div className="flex items-center justify-center min-h-screen px-4 text-center">
//                     <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
//                     <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
//                         <Dialog.Title className="text-lg font-medium">Research Topic Details</Dialog.Title>
//                         <Dialog.Description className="mt-2 text-sm text-gray-500">
//                             {currentDescription}
//                         </Dialog.Description>
//                         <button
//                             className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
//                             onClick={closeModal}
//                         >
//                             Close
//                         </button>
//                     </div>
//                 </div>
//             </Dialog>
//         </div>
//     );
// }
