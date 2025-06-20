document.addEventListener("DOMContentLoaded", function() {
  AOS.init();

  const formBusqueda = document.querySelector(".formBusqueda");
  formBusqueda.addEventListener("submit", async function(event) {
    event.preventDefault();

    

    const ciudad = document.getElementById("destino").value.trim();
    if (!ciudad) {
      alert("Por favor ingresa un destino válido.");
      return;
    }

    actualizarMapa(ciudad);

    try {
      const geoId = await obtenerGeoId(ciudad);

      if (geoId) {
        const hoteles = await obtenerHoteles(geoId);
        mostrarHoteles(hoteles);
      } else {
        alert("No se encontró la ciudad en la API.");
      }
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      alert("Error al buscar hoteles.");
    }
  });
});

function actualizarMapa(ciudad) {
  const mapaIframe = document.getElementById("mapaIframe");
  const urlMapa = `https://www.google.com/maps?q=hoteles+en+${encodeURIComponent(ciudad)}&output=embed`;
  mapaIframe.src = urlMapa;
}

const apiKey = "7bf5e90d41mshb5edc13b055dc25p1144a3jsn374e1886c8e3";
const apiHost = "travel-advisor.p.rapidapi.com";

async function obtenerGeoId(ciudad) {
  const url = `https://travel-advisor.p.rapidapi.com/locations/v2/auto-complete?query=${encodeURIComponent(ciudad)}&lang=es`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": apiHost
    }
  });

  if (!response.ok) {
    throw new Error("Error en la respuesta de la API de ubicación");
  }

  const data = await response.json();

  // Revisar la estructura y hacer fallback
  const resultados = data.data?.Typeahead_autocomplete?.results || [];

  // Buscar geoId de un resultado tipo 'CITY' o similar
  const lugar = resultados.find(r => r.detailsV2?.geoId && (r.result_type === "CITY" || r.result_type === "geo"));

  return lugar ? lugar.detailsV2.geoId : null;
}

async function obtenerHoteles(geoId) {
  const url = `https://travel-advisor.p.rapidapi.com/hotels/list?location_id=${geoId}&lang=es&currency=USD&limit=10`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": apiHost
    }
  });

  if (!response.ok) {
    throw new Error("Error en la respuesta de la API de hoteles");
  }

  const data = await response.json();
  const hoteles = data.data?.body?.searchResults?.results || [];
  return hoteles;
}

function mostrarHoteles(hoteles) {
  const lista = document.getElementById("listaHoteles");
  lista.innerHTML = "";

  if (hoteles.length === 0) {
    lista.innerHTML = "<li>No se encontraron hoteles</li>";
    return;
  }

  hoteles.forEach(hotel => {
    const li = document.createElement("li");
    li.textContent = hotel.name || "Hotel sin nombre";
    lista.appendChild(li);
  });
}

