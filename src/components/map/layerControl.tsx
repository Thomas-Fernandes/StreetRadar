/**
 * LayerControl.tsx
 * 
 * Composant pour afficher et gérer les contrôles de couches Street View
 * Stylisé avec Tailwind CSS pour s'intégrer harmonieusement avec le reste de l'interface
 */

import React from 'react';

interface LayerControlProps {
  visibleLayers: {
    googleStreetView: boolean;
    bingStreetside: boolean;
    yandexPanoramas: boolean;
    appleLookAround: boolean;
  };
  toggleLayer: (layer: string) => void;
}

const LayerControl: React.FC<LayerControlProps> = ({ visibleLayers, toggleLayer }) => {
  return (
    <div className="absolute top-3 right-3 z-10 bg-white bg-opacity-90 rounded-lg shadow-md p-3 w-64">
      <h3 className="text-gray-800 font-medium mb-2 text-sm">
        Couches de Street View
      </h3>
      
      <div className="space-y-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="google-layer"
            checked={visibleLayers.googleStreetView}
            onChange={() => toggleLayer('googleStreetView')}
            className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="google-layer" className="ml-2 text-[#4285F4] cursor-pointer text-sm">
            Google Street View
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="bing-layer"
            checked={visibleLayers.bingStreetside}
            onChange={() => toggleLayer('bingStreetside')}
            className="h-4 w-4 text-purple-500 focus:ring-purple-500 border-gray-300 rounded"
          />
          <label htmlFor="bing-layer" className="ml-2 text-[#8661C5] cursor-pointer text-sm">
            Bing Streetside
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="yandex-layer"
            checked={visibleLayers.yandexPanoramas}
            onChange={() => toggleLayer('yandexPanoramas')}
            className="h-4 w-4 text-red-500 focus:ring-red-500 border-gray-300 rounded"
          />
          <label htmlFor="yandex-layer" className="ml-2 text-[#FF0000] cursor-pointer text-sm">
            Yandex Panoramas
          </label>
        </div>
      </div>
    </div>
  );
};

export default LayerControl;