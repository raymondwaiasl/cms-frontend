// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SortModel } from '../../../api/common';
import { useWidget, useApi } from '../../../hooks';
import './GisWidget.css';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  List,
  ListItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Feature } from 'ol';
import Map from 'ol/Map.js';
import Overlay from 'ol/Overlay.js';
import View from 'ol/View.js';
import { Coordinate } from 'ol/coordinate';
import { easeOut } from 'ol/easing';
import { xhr } from 'ol/featureloader';
import GeoJSON from 'ol/format/GeoJSON';
import WFS from 'ol/format/WFS';
import { Polygon, Point, Geometry } from 'ol/geom';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import 'ol/ol.css';
import { fromLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM.js';
import VectorSource from 'ol/source/Vector';
import Vector from 'ol/source/Vector.js';
import { Circle, Fill, Stroke, Style, Text } from 'ol/style';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from 'react-query';
import { RMap, ROSM, RLayerVector, RFeature, ROverlay, RPopup, RFeatureUIEvent } from 'rlayers';
import {
  useRStyle,
  RStyle,
  RStyleArray,
  RStroke,
  RFill,
  RCircle,
  RText,
  RBackground,
} from 'rlayers/style';

const GisWIdget = () => {
  console.log('running');
  const client = useApi();
  const { data, config, updateWidget } = useWidget<
    {
      geoData?: string;
      typeId?: string;
      folderId?: string;
      targetedKey: string;
      coordinate?: [number, number];
    },
    { typeId: string; folderId: string; targetedKey: string }
  >('GIS');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [isFeatureLoaded, setIsFeatureLoaded] = useState(false);
  const [sortModel, setSortModel] = useState<SortModel[]>([]);
  const popup = useRef<RPopup>();
  const { data: tableColumn, isLoading } = useQuery(
    [
      'Record table',
      config.config.folderId,
      config.config.typeId,
      data.folderId,
      data.typeId,
      sortModel,
      page,
      pageSize,
    ],
    async () => {
      const { data: tableResponse } = await client.recordService.getFolderRecordList({
        typeId: data.typeId || config.config.typeId,
        folderId: data.folderId || config.config.folderId,
        sortModel,
        pageState: { page: page, pageSize: pageSize },
      });
      return tableResponse;
    },
    {
      enabled:
        (!!config.config.folderId && !!config.config.folderId) ||
        (!!data.folderId && !!data.typeId),
    }
  );
  const mapRef = useRef<RMap>(null);
  console.log(mapRef.current);
  const popupRef = useRef<RPopup>(null);
  const currentLocation = useRef<Coordinate | null>(null);
  // const hoverLocation = useRef<number | null>(null);
  const [map, setMap] = useState<Map | null>(null);
  console.log(map);
  // const [query, setQuery] = useState<string>('');
  const markerRef = useRef<Overlay | null>(null);
  // console.log(popupRef.current && popupRef.current.classList);
  const [layer, setLayer] = useState<VectorLayer<VectorSource> | null>(null);
  const [dataLayer, setDataLayer] = useState<VectorLayer<VectorSource> | null>(null);
  const [properties, setProperties] = useState<any>(null);
  const [coordinate, setCoordinate] = useState<Coordinate | null>();
  const [geometry, setGeometry] = useState<Geometry | null>();
  const [hoverLocation, setHoverLocation] = useState<string | null>();
  const [districtFeatures, setDistrictfeatures] = useState<Feature<Geometry>[]>();
  // useEffect(() => {
  //   const source = new VectorSource({
  //     format: new GeoJSON(),
  //     url: 'https://api.csdi.gov.hk/apim/dataquery/api/?id=had_rcd_1634523272907_75218&layer=dcd&bbox-crs=WGS84&bbox=113.8,22.1,114.7,23.0&limit=100&offset=0',
  //   });
  //   markerRef.current = new Overlay({
  //     id: 'info',
  //     autoPan: true,
  //     position: undefined,
  //     offset: [0, -10],
  //     positioning: 'bottom-center',
  //     element: popupRef.current ?? undefined,
  //   });
  //   let mapLayer = new VectorLayer({
  //     opacity: 0.8,
  //     source,
  //     style: (feature, res) => {
  //       console.log(feature.getProperties());
  //       return new Style({
  //         fill: new Fill({
  //           color: hoverLocation.current === feature.getProperties().LCODE ? 'red' : 'black',
  //         }),
  //         stroke: new Stroke({
  //           color: 'white',
  //         }),
  //         text: new Text({
  //           font: '15px sans-serif',
  //           justify: 'right',
  //           fill: new Fill({
  //             color: 'white',
  //           }),
  //           text: feature.getProperties()['NAME_TC'],
  //         }),
  //       });
  //     },
  //   });
  //   setLayer(mapLayer);
  //   let mapObject = new Map({
  //     layers: [
  //       new TileLayer({
  //         source: new OSM(),
  //       }),
  //       mapLayer,
  //       // new VectorLayer({
  //       //   source: new VectorSource({
  //       //     format: new GeoJSON(),
  //       //     url: 'https://api.csdi.gov.hk/apim/dataquery/api/?id=had_rcd_1634523272907_75218&layer=dcd&bbox-crs=WGS84&bbox=113.8,22.1,114.7,23.0&limit=100&offset=0',
  //       //   }),
  //       //   updateWhileAnimating: true,
  //       //   style: new Style({
  //       //     image: new Circle({
  //       //       radius: 5,
  //       //       fill: new Fill({
  //       //         color: 'orange',
  //       //       }),
  //       //     }),
  //       //     zIndex: 10,
  //       //   }),
  //       // }),
  //     ],
  //     view: new View({
  //       center: [12703553.2198509, 2558197.61549422],
  //       zoom: 10,
  //     }),
  //     overlays: [markerRef.current],
  //   });
  //   setMap(mapObject);
  //   mapRef?.current && mapObject.setTarget(mapRef?.current);
  //   return () => {
  //     mapObject.setTarget(undefined);
  //     mapObject.dispose();
  //   };
  // }, [mapRef.current, popupRef.current]);
  // useEffect(() => {
  //   if (map && tableColumn) {
  //     console.log(data.geoData);
  //     if (dataLayer) map.removeLayer(dataLayer);
  //     const index = tableColumn.columnList.findIndex(
  //       (item) => item.misColumnLabel === data.targetedKey
  //     );
  //     const geoJson = JSON.stringify({
  //       features: tableColumn?.recordList.map((item) => {
  //         const data = JSON.parse(item[index]);
  //         data.properties.ID = item[0];
  //         return data;
  //       }),
  //       type: 'FeatureCollection',
  //     });
  //     console.log(geoJson);
  //     let source = new VectorSource();
  //     source.addFeatures(
  //       new GeoJSON().readFeatures(geoJson, {
  //         dataProjection: 'EPSG:4326',
  //         featureProjection: map.getView().getProjection(),
  //       })
  //     );
  //     let newLayer = new VectorLayer({
  //       source,
  //       style: new Style({
  //         fill: new Fill({
  //           color: 'orange',
  //         }),
  //         stroke: new Stroke({
  //           color: 'white',
  //         }),

  //         text: new Text({
  //           font: '15px sans-serif',
  //           justify: 'right',
  //           fill: new Fill({
  //             color: 'white',
  //           }),
  //           // text: feature.getProperties().CNAME,
  //         }),
  //       }),
  //     });
  //     map.addLayer(newLayer);
  //     setDataLayer(newLayer);

  //     if (data.coordinate) map.getView().animate({ zoom: 16, center: fromLonLat(data.coordinate) });
  //   }
  // }, [map, tableColumn, data.coordinate]);
  // useEffect(() => {
  //   map?.on('click', (event) => {
  //     // event.map.
  //     console.log(map.getFeaturesAtPixel(event.pixel));
  //     let target = map.getFeaturesAtPixel(event.pixel)[0];
  //     currentLocation.current = event.coordinate;
  //     if (target) {
  //       console.log(event);
  //       if (markerRef.current) {
  //         markerRef.current.setPosition(event.coordinate);
  //         markerRef.current.panIntoView();
  //         console.log(markerRef.current.getRevision());

  //         console.log(target.getProperties());
  //         setProperties(target.getProperties());
  //         map.getView().animate({ zoom: 12, center: event.coordinate });
  //         markerRef.current.setPosition(event.coordinate);
  //         markerRef.current.panIntoView();
  //         console.log(markerRef.current.getRevision());
  //         console.log(target.getGeometry());
  //         const targetgeometry = target?.getGeometry();
  //         const targetSource = dataLayer?.getSource();

  //         console.log(targetgeometry);
  //         if (targetgeometry && targetSource) {
  //           const idList: string[] = [];
  //           targetSource.forEachFeatureIntersectingExtent(targetgeometry.getExtent(), (feat) => {
  //             idList.push(feat.getProperties().ID as string);
  //           });
  //           console.log(idList);
  //           updateWidget('Record List', {
  //             filterKeyword: idList.join(',') ?? '',
  //           });
  //         }
  //         setProperties(target.getProperties());
  //         map.getView().animate({ zoom: 12, center: event.coordinate });
  //       }
  //     }
  //     if (!target && markerRef.current) {
  //       markerRef.current.setPosition(undefined);
  //       currentLocation.current = null;
  //       setProperties(null);
  //     }
  //   });
  //   map?.on('pointermove', (event) => {
  //     let featureResult = map.getFeaturesAtPixel(event.pixel);
  //     let target = map.getFeaturesAtPixel(event.pixel)[0];
  //     if (featureResult.length === 0) {
  //       layer?.setStyle((feature) => {
  //         return new Style({
  //           fill: new Fill({
  //             color: 'black',
  //           }),
  //           stroke: new Stroke({
  //             color: 'white',
  //           }),
  //           text: new Text({
  //             font: '15px sans-serif',
  //             justify: 'right',
  //             fill: new Fill({
  //               color: 'white',
  //             }),
  //             text: feature.get('CNAME'),
  //           }),
  //         });
  //       });
  //       return;
  //     }
  //     if (target) hoverLocation.current = target.getProperties()['NAME_TC'];
  //     layer?.setStyle((feature) => {
  //       return new Style({
  //         fill: new Fill({
  //           color: hoverLocation.current === feature.getProperties()['NAME_TC'] ? 'red' : 'black',
  //         }),
  //         stroke: new Stroke({
  //           color: 'white',
  //         }),
  //         text: new Text({
  //           font: '15px sans-serif',
  //           justify: 'right',
  //           fill: new Fill({
  //             color: 'white',
  //           }),
  //           text: feature.get('NAME_TC'),
  //         }),
  //       });
  //     });
  //   });
  //   return () => {
  //     map?.removeEventListener('click', () => {
  //       console.log('bye');
  //     });

  //     map?.removeEventListener('click', () => {
  //       console.log('bye');
  //     });
  //   };
  // }, [map]);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <RMap
        width={'100%'}
        height={'100%'}
        initial={{ center: [12703553.2198509, 2558197.61549422], zoom: 10 }}
        ref={mapRef}
        onSingleClick={(evt) => {
          console.log('click', evt.map.getFeaturesAtPixel(evt.pixel).length);
          if (!evt.map.getFeaturesAtPixel(evt.pixel).length) {
            popupRef.current?.hide();
          }
        }}
      >
        <ROSM />
        <RLayerVector
          opacity={0.8}
          format={new GeoJSON()}
          onFeaturesLoadEnd={(e) => {
            setIsFeatureLoaded(true);
            console.log(e.features);
            setDistrictfeatures(e.features);
          }}
          url={
            'https://api.csdi.gov.hk/apim/dataquery/api/?id=had_rcd_1634523272907_75218&layer=dcd&bbox-crs=WGS84&bbox=113.8,22.1,114.7,23.0&limit=100&offset=0'
          }
          onClick={(e) => {
            console.log(coordinate);

            console.log('click', e.target.getProperties());
            setProperties(e.target.getProperties());
            setCoordinate(e.coordinate);
            setGeometry(e.target.getGeometry());
            e.map.getView().animate({ center: e.coordinate });
            popupRef.current?.show();
          }}
          onPointerMove={useCallback(
            (e: RFeatureUIEvent) => {
              return setHoverLocation(e.target.getProperties()['AREA_ID']);
            },
            [hoverLocation]
          )}
          onPointerLeave={useCallback(() => {
            return setHoverLocation(null);
          }, [hoverLocation])}
        >
          <RStyleArray
            render={(feature: Feature<Geometry>) => (
              <>
                <RStyle zIndex={0}>
                  <RStroke color="white" width={1} />
                  <RFill color={hoverLocation === feature.get('AREA_ID') ? 'red' : 'black'} />
                  <RText font="15px sans-serif" textAlign="right" text={feature.get('NAME_TC')}>
                    <RFill color="white" />
                  </RText>
                </RStyle>
              </>
            )}
          />
          <RFeature
            geometry={
              geometry ? geometry : new Point(fromLonLat([12703553.2198509, 2558197.61549422]))
            }
          >
            <RPopup ref={popupRef}>
              <Card sx={{ maxHeight: '200px', maxWidth: '300px', overflow: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableCell colSpan={2}>Search result:</TableCell>
                  </TableHead>
                  <TableBody>
                    {properties &&
                      Object.entries(properties)
                        .filter(([item]) => item !== 'geometry')
                        .map(([key, value], number) => (
                          <TableRow key={number}>
                            <TableCell>{key}:</TableCell>
                            <TableCell>{value as string}</TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </Card>
            </RPopup>
            <RPopup trigger="hover">
              <Card sx={{ maxHeight: '200px', maxWidth: '300px', overflow: 'auto' }}>hi</Card>
            </RPopup>
          </RFeature>
        </RLayerVector>
      </RMap>
    </div>
  );
};

export default GisWIdget;
