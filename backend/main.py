from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import osmnx as ox
import networkx as nx
from shapely.geometry import Polygon, MultiPolygon
import geopandas as gpd
import json

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://geoproduct.github.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 입력 데이터 모델
class IsochroneRequest(BaseModel):
    lat: float
    lng: float
    minutes: int

@app.post("/isochrone")
def get_isochrone(data: IsochroneRequest):
    speed_kph = 4  # 도보
    travel_time = data.minutes  # 분 단위

    G = ox.graph_from_point((data.lat, data.lng), dist=2000, network_type='walk')
    G = ox.speed.add_edge_speeds(G, hwy_speeds=None)  # 기본 속도 세팅
    G = ox.speed.add_edge_travel_times(G)

    center_node = ox.distance.nearest_nodes(G, data.lng, data.lat)
    subgraph = nx.ego_graph(G, center_node, radius=travel_time * 60, distance='travel_time')

    node_points = [ (data['x'], data['y']) for _, data in subgraph.nodes(data=True)]
    gdf_nodes = gpd.GeoDataFrame(geometry=gpd.points_from_xy(*zip(*node_points)))
    polygon = gdf_nodes.unary_union.convex_hull

    return {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": json.loads(gpd.GeoSeries([polygon]).to_json())['features'][0]['geometry'],
            "properties": {"mode": "walk", "minutes": travel_time}
        }]
    }
